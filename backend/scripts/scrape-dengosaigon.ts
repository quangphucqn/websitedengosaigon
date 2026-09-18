/* eslint-disable no-console */
// Scrape + seed dengosaigon.com products + posts into local MongoDB.
// Usage: tsx scripts/scrape-dengosaigon.ts
//
// Requires: MONGODB_URI in .env
// Optional: CLOUDINARY_* in .env. If present, uploads images to Cloudinary and
// stores secure_url. If absent, falls back to external image URLs.

import 'dotenv/config';
import { setTimeout as sleep } from 'node:timers/promises';
import axios from 'axios';
import { load } from 'cheerio';
import mongoose, { Schema } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

type ProductCategory = 'den-ban' | 'den-treo' | 'den-dung' | 'den-ngu';

interface ScrapedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  stock: number;
  isFeatured: boolean;
  isPublished: boolean;
}

interface ScrapedPost {
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  images: string[];
  isPublished: boolean;
}

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
};

const BASE = 'https://dengosaigon.com';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120);
}

function categoryFromName(name: string): ProductCategory {
  const lower = name.toLowerCase();
  if (lower.includes('treo') || lower.includes('ốp trần')) return 'den-treo';
  if (lower.includes('đứng') || lower.includes('sàn')) return 'den-dung';
  if (lower.includes('ngủ')) return 'den-ngu';
  return 'den-ban';
}

async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get<string>(url, {
    headers: HEADERS,
    timeout: 30000,
    responseType: 'text',
    // WordPress sites sometimes require accepting compressed responses
    decompress: true,
  });
  return res.data;
}

async function uploadToCloudinaryIfPossible(
  imageUrl: string,
  folder: string,
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return imageUrl;
  if (!imageUrl.startsWith('http')) return imageUrl;
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: `dengosaigon/${folder}`,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (err) {
    console.warn(
      `  ! Cloudinary upload failed for ${imageUrl}, keeping original URL`,
      err instanceof Error ? err.message : err,
    );
    return imageUrl;
  }
}

interface SearchHit {
  title: string;
  url: string;
  descriptionShort: string;
  price?: number;
  thumb?: string;
}

function parseSearchPage(html: string): SearchHit[] {
  const $ = load(html);
  const hits: SearchHit[] = [];
  // Articles in the search results
  $('article').each((_, el) => {
    const $el = $(el);
    const titleAnchor = $el.find('h2 a, h3 a, .entry-title a').first();
    const title = titleAnchor.text().trim();
    const href = titleAnchor.attr('href');
    if (!title || !href) return;
    const $thumb = $el.find('img').first();
    const thumb =
      $thumb.attr('data-src') ??
      $thumb.attr('data-lazy-src') ??
      $thumb.attr('src') ??
      undefined;
    const desc = $el.text().replace(/\s+/g, ' ').trim().substring(0, 400);
    hits.push({ title, url: href, descriptionShort: desc, thumb });
  });
  return hits;
}

function extractPrice(text: string): number | undefined {
  const match = text.match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:vnd|vnđ)/i);
  if (!match) return undefined;
  return Number(match[1].replace(/\./g, ''));
}

async function crawlProductList(): Promise<ScrapedProduct[]> {
  // WordPress search returns mixed results (posts + product CPTs).
  // We aggregate over several keywords to be thorough.
  const queries = ['', 'den', 'ban', 'treo', 'ngu', 'dung', 'go', 'trang tri'];
  const seen = new Map<string, SearchHit>();

  for (const q of queries) {
    const url = q ? `${BASE}/?s=${encodeURIComponent(q)}` : `${BASE}/`;
    console.log(`\n→ Search ${url}`);
    try {
      const html = await fetchHtml(url);
      const hits = parseSearchPage(html);
      console.log(`  ${hits.length} hits`);
      for (const hit of hits) {
        if (!seen.has(hit.url)) seen.set(hit.url, hit);
      }
    } catch (err) {
      console.warn(
        `  ! Search failed:`,
        err instanceof Error ? err.message : err,
      );
    }
    await sleep(800);
  }

  const candidates = [...seen.values()].filter((hit) =>
    hit.url.startsWith(BASE),
  );
  console.log(`\n→ Total unique URLs: ${candidates.length}`);

  const products: ScrapedProduct[] = [];
  for (const hit of candidates) {
    // Heuristic: product pages contain "THÔNG TIN SẢN PHẨM" or price bullets
    try {
      const html = await fetchHtml(hit.url);
      const $ = load(html);
      const bodyText = $('body').text();
      const hasInfoSection = /THÔNG TIN SẢN PHẨM/i.test(bodyText);
      const hasPrice = /Giá[: ]/i.test(bodyText) || /\d+\.\d+\.\d+\s*VND/i.test(bodyText);
      const slugMatch = hit.url.match(/\/([a-z0-9-]+)\/?$/);
      const slug = slugMatch ? slugMatch[1] : slugify(hit.title);

      // If clearly an article (no product info / price), skip for products
      if (!hasInfoSection && !hasPrice && !/dg\d{3,}/i.test(hit.title)) {
        continue;
      }

      // Gather all product images
      const imageSet = new Set<string>();
      $('img').each((_, img) => {
        const $img = $(img);
        const src =
          $img.attr('data-src') ??
          $img.attr('data-lazy-src') ??
          $img.attr('src') ??
          '';
        if (!src) return;
        const absolute = src.startsWith('http')
          ? src
          : new URL(src, BASE).toString();
        if (!absolute.includes('logo') && !absolute.includes('icon')) {
          imageSet.add(absolute);
        }
      });

      // Pick description from the first paragraphs after the info block
      const description = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 1500);

      // Price extraction
      const priceMatch = bodyText.match(/Giá[: ]+([\d.]+)\s*(?:VND|vnd|vnđ)/i);
      const price = priceMatch
        ? Number(priceMatch[1].replace(/\./g, ''))
        : extractPrice(bodyText) ?? 1000000;

      const name = $('h1').first().text().trim() || hit.title;
      const category = categoryFromName(name);

      products.push({
        name,
        slug: slugify(name) || slug,
        description:
          description.length > 80
            ? description
            : `${name} - sản phẩm đèn gỗ thủ công từ Đèn Gỗ Sài Gòn, làm từ gỗ tự nhiên, hoàn thiện bằng tay, phù hợp trang trí phòng khách, phòng ngủ, nhà hàng, quán cafe, homestay. Sản phẩm chưa bao gồm dây đui đế và bóng đèn.`,
        price,
        images: [...imageSet].slice(0, 8),
        category,
        stock: 10,
        isFeatured: false,
        isPublished: true,
      });
      console.log(`  ✓ ${name} — ${price.toLocaleString('vi-VN')} VND — ${imageSet.size} imgs`);
    } catch (err) {
      console.warn(
        `  ! Failed to parse product ${hit.url}:`,
        err instanceof Error ? err.message : err,
      );
    }
    await sleep(600);
  }

  // Dedupe by slug
  const bySlug = new Map<string, ScrapedProduct>();
  for (const p of products) bySlug.set(p.slug, p);
  return [...bySlug.values()];
}

async function crawlBlogPosts(): Promise<ScrapedPost[]> {
  console.log(`\n→ Fetching blog index ${BASE}/blog/`);
  const html = await fetchHtml(`${BASE}/blog/`);
  const $ = load(html);
  const articleUrls = new Set<string>();
  $('article h2 a, article h3 a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith(BASE)) articleUrls.add(href);
  });
  // Pagination: /blog/page/2/
  for (let page = 2; page <= 5; page++) {
    try {
      const phtml = await fetchHtml(`${BASE}/blog/page/${page}/`);
      const $p = load(phtml);
      let found = 0;
      $p('article h2 a, article h3 a').each((_, el) => {
        const href = $p(el).attr('href');
        if (href && href.startsWith(BASE)) {
          articleUrls.add(href);
          found++;
        }
      });
      if (found === 0) break;
    } catch {
      break;
    }
    await sleep(800);
  }
  console.log(`  ${articleUrls.size} unique post URLs`);

  const posts: ScrapedPost[] = [];
  for (const url of articleUrls) {
    try {
      const ph = await fetchHtml(url);
      const $$ = load(ph);
      const title = $$('h1').first().text().trim();
      const content = $$('article .entry-content, .post-content').first().text().replace(/\s+/g, ' ').trim();
      const images = new Set<string>();
      $$('article img, .entry-content img').each((_, img) => {
        const $i = $$(img);
        const src =
          $i.attr('data-src') ??
          $i.attr('data-lazy-src') ??
          $i.attr('src') ??
          '';
        if (!src) return;
        const absolute = src.startsWith('http')
          ? src
          : new URL(src, BASE).toString();
        if (!absolute.includes('logo')) images.add(absolute);
      });
      const imageList = [...images];
      const slugMatch = url.match(/\/([a-z0-9-]+)\/?$/);
      const slug = slugMatch ? slugMatch[1] : slugify(title);
      posts.push({
        title,
        slug,
        content: content || title,
        coverImage: imageList[0] ?? '',
        images: imageList.slice(0, 6),
        isPublished: true,
      });
      console.log(`  ✓ ${title}`);
    } catch (err) {
      console.warn(
        `  ! Failed post ${url}:`,
        err instanceof Error ? err.message : err,
      );
    }
    await sleep(500);
  }
  const bySlug = new Map<string, ScrapedPost>();
  for (const p of posts) bySlug.set(p.slug, p);
  return [...bySlug.values()];
}

const ProductSchemaDef = new Schema(
  {
    name: String,
    slug: { type: String, unique: true, index: true },
    description: String,
    price: Number,
    images: [String],
    category: String,
    stock: Number,
    isFeatured: Boolean,
    isPublished: Boolean,
  },
  { timestamps: true, collection: 'products' },
);

const PostSchemaDef = new Schema(
  {
    title: String,
    slug: { type: String, unique: true, index: true },
    content: String,
    coverImage: String,
    images: [String],
    isPublished: Boolean,
  },
  { timestamps: true, collection: 'posts' },
);

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(mongoUri);
  console.log('✓ MongoDB connected');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✓ Cloudinary configured');
  } else {
    console.log('⚠ Cloudinary not configured — keeping external image URLs');
  }

  const products = await crawlProductList();
  console.log(`\n=== Products collected: ${products.length}`);

  const posts = await crawlBlogPosts();
  console.log(`\n=== Posts collected: ${posts.length}`);

  // Optionally upload images
  console.log('\n→ Uploading images to Cloudinary (if configured)...');
  for (const p of products) {
    p.images = await Promise.all(
      p.images.map((u) => uploadToCloudinaryIfPossible(u, 'products')),
    );
  }
  for (const post of posts) {
    post.coverImage = await uploadToCloudinaryIfPossible(
      post.coverImage,
      'posts',
    );
    post.images = await Promise.all(
      post.images.map((u) => uploadToCloudinaryIfPossible(u, 'posts')),
    );
  }

  const ProductModel = mongoose.model('Product', ProductSchemaDef);
  const PostModel = mongoose.model('Post', PostSchemaDef);

  console.log('\n→ Inserting products...');
  let insertedP = 0;
  for (const p of products) {
    if (p.images.length === 0) continue;
    try {
      await ProductModel.updateOne(
        { slug: p.slug },
        { $set: p },
        { upsert: true },
      );
      insertedP++;
    } catch (err) {
      console.warn(
        `  ! Failed upsert product ${p.slug}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  console.log(`✓ Products upserted: ${insertedP}`);

  console.log('\n→ Inserting posts...');
  let insertedPosts = 0;
  for (const post of posts) {
    try {
      await PostModel.updateOne(
        { slug: post.slug },
        { $set: post },
        { upsert: true },
      );
      insertedPosts++;
    } catch (err) {
      console.warn(
        `  ! Failed upsert post ${post.slug}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  console.log(`✓ Posts upserted: ${insertedPosts}`);

  await mongoose.disconnect();
  console.log('\n✅ Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

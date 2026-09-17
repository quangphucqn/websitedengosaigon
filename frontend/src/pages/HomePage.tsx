import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { ProductCard } from '../components/ProductCard'
import { categoryLabel } from '../lib/format'
import type { Banner, Post, Product } from '../types'

function Hero({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0)
  const touchStart = useRef<number | null>(null)
  const hasBanners = banners.length > 0

  useEffect(() => {
    if (banners.length < 2) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % banners.length), 6000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  const previous = () => setActive((index) => (index - 1 + banners.length) % banners.length)
  const next = () => setActive((index) => (index + 1) % banners.length)
  const banner = banners[active]

  const onTouchEnd = (endX: number) => {
    if (touchStart.current === null || banners.length < 2) return
    const distance = endX - touchStart.current
    touchStart.current = null
    if (Math.abs(distance) < 45) return
    if (distance > 0) previous()
    else next()
  }

  return (
    <section
      className="home-hero"
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null }}
      onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
    >
      {hasBanners ? (
        <>
          <img key={banner._id} src={banner.imageUrl} alt={banner.title || 'Không gian Đèn Gỗ Sài Gòn'} />
          <div className="hero-overlay" />
          <div className="shell hero-copy">
            <p className="hero-kicker">Đèn gỗ làm thủ công</p>
            <h1>{banner.title || 'Ánh sáng được làm để ở lại cùng không gian sống.'}</h1>
            <Link className="button button-light" to={banner.link || '/san-pham'}>Khám phá bộ sưu tập</Link>
          </div>
          {banners.length > 1 && <div className="hero-controls shell">
            <button type="button" onClick={previous} aria-label="Banner trước"><ChevronLeft aria-hidden="true" /></button>
            <div className="hero-dots">{banners.map((item, index) => <button key={item._id} type="button" className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} aria-label={`Xem banner ${index + 1}`} />)}</div>
            <button type="button" onClick={next} aria-label="Banner tiếp"><ChevronRight aria-hidden="true" /></button>
          </div>}
        </>
      ) : (
        <div className="fallback-hero">
          <div className="shell hero-copy">
            <p className="hero-kicker">Đèn gỗ làm thủ công</p>
            <h1>Ánh sáng được làm để ở lại cùng không gian sống.</h1>
            <Link className="button button-light" to="/san-pham">Khám phá bộ sưu tập</Link>
          </div>
        </div>
      )}
    </section>
  )
}

export function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api<Banner[]>('/banners'), api<Product[]>('/products?featured=true'), api<Post[]>('/posts')])
      .then(([loadedBanners, products, loadedPosts]) => {
        setBanners(loadedBanners)
        setFeatured(products)
        setPosts(loadedPosts.slice(0, 2))
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải trang chủ.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading label="Đang thắp sáng không gian…" />
  if (error) return <div className="shell page-space"><ErrorMessage message={error} /></div>

  return (
    <>
      <Hero banners={banners} />
      <section className="shell home-intro section-space">
        <p className="side-label">Từ xưởng nhỏ ở Sài Gòn</p>
        <div><h2>Mỗi đường vân có một nhịp riêng. Chúng tôi giữ lại điều đó trong từng chiếc đèn.</h2><p>Gỗ tự nhiên, ánh sáng vàng dịu và những hình dáng vừa đủ để căn phòng có thêm một điểm dừng.</p></div>
      </section>
      <section className="shell section-space featured-section">
        <div className="section-heading"><div><p className="side-label">Được chọn nhiều</p><h2>Những nguồn sáng nổi bật</h2></div><Link className="text-link" to="/san-pham">Xem tất cả</Link></div>
        {featured.length ? <div className="featured-grid">{featured.slice(0, 3).map((product) => <ProductCard key={product._id} product={product} featured />)}</div> : <p>Những sản phẩm đầu tiên đang được hoàn thiện.</p>}
      </section>
      <section className="category-strip">
        <div className="shell"><p className="side-label">Chọn theo nhu cầu</p><div className="category-links">{(['den-ban', 'den-treo', 'den-dung', 'den-ngu'] as const).map((category) => <Link key={category} to={`/san-pham?category=${category}`}>{categoryLabel[category]}</Link>)}</div></div>
      </section>
      <section className="shell section-space journal-section">
        <div className="section-heading"><div><p className="side-label">Góc kể chuyện</p><h2>Ánh sáng trong nhà</h2></div><Link className="text-link" to="/bai-viet">Đọc tất cả</Link></div>
        <div className="post-grid">{posts.map((post) => <Link className="post-preview" key={post._id} to={`/bai-viet/${post.slug}`}><div className="post-image">{post.coverImage && <img src={post.coverImage} alt="" />}</div><div><p>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p><h3>{post.title}</h3><span>Đọc bài viết</span></div></Link>)}</div>
      </section>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { ProductCard } from '../components/ProductCard'
import { Reveal, RevealStagger } from '../components/Reveal'
import { useCategories } from '../lib/categories'
import type { Banner, IntroSlide, PaginatedResponse, Post, Product } from '../types'

function Hero({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const dragDelta = useRef(0)
  const hasBanners = banners.length > 0

  useEffect(() => {
    if (banners.length < 2) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % banners.length), 5000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  const goTo = (index: number) => setActive((index + banners.length) % banners.length)
  const banner = banners[active]

  const finishSwipe = (endX: number, endY: number) => {
    const start = touchStart.current
    touchStart.current = null
    dragDelta.current = 0
    if (!start || banners.length < 2) return
    const dx = endX - start.x
    const dy = endY - start.y
    // Only treat as horizontal swipe (avoid hijacking vertical scroll)
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return
    if (dx > 0) goTo(active - 1)
    else goTo(active + 1)
  }

  const onPointerDown = (event: React.PointerEvent) => {
    if (banners.length < 2) return
    touchStart.current = { x: event.clientX, y: event.clientY }
    dragDelta.current = 0
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    if (!touchStart.current) return
    dragDelta.current = event.clientX - touchStart.current.x
  }

  return (
    <section
      className="home-hero"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => finishSwipe(event.clientX, event.clientY)}
      onPointerCancel={() => { touchStart.current = null; dragDelta.current = 0 }}
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
          {banners.length > 1 && (
            <div className="hero-controls shell">
              <div className="hero-dots" role="group" aria-label="Chọn banner">
                {banners.map((item, index) => (
                  <button
                    key={item._id}
                    type="button"
                    className={index === active ? 'is-active' : ''}
                    onClick={() => goTo(index)}
                    aria-label={`Xem banner ${index + 1}`}
                    aria-pressed={index === active}
                  />
                ))}
              </div>
            </div>
          )}
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

const fallbackIntroSlide: IntroSlide = {
  _id: 'fallback-intro',
  eyebrow: 'Từ xưởng nhỏ ở Sài Gòn',
  heading: 'Mỗi đường vân có một nhịp riêng. Chúng tôi giữ lại điều đó trong từng chiếc đèn.',
  body: 'Gỗ tự nhiên, ánh sáng vàng dịu và những hình dáng vừa đủ để căn phòng có thêm một điểm dừng.',
  order: 0,
  isActive: true,
}

function IntroSlider({ slides }: { slides: IntroSlide[] }) {
  const items = slides.length ? slides : [fallbackIntroSlide]
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (items.length < 2 || paused) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % items.length), 5000)
    return () => window.clearInterval(timer)
  }, [items.length, paused])

  const goTo = (index: number) => setActive((index + items.length) % items.length)
  const clampedActive = active >= items.length ? 0 : active

  const finishSwipe = (endX: number, endY: number) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start || items.length < 2) return
    const dx = endX - start.x
    const dy = endY - start.y
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return
    goTo(clampedActive + (dx > 0 ? -1 : 1))
  }

  const current = items[clampedActive] ?? items[0]

  return (
    <section
      className="shell intro-slider section-space"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={(event) => {
        if (items.length < 2) return
        touchStart.current = { x: event.clientX, y: event.clientY }
        ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
      }}
      onPointerUp={(event) => finishSwipe(event.clientX, event.clientY)}
      onPointerCancel={() => { touchStart.current = null }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') goTo(active - 1)
        if (event.key === 'ArrowRight') goTo(active + 1)
      }}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Giới thiệu về Đèn Gỗ Sài Gòn"
    >
      <div className="intro-slider-frame">
        <div key={current._id} className="intro-slide is-visible" aria-live="polite">
          <p className="side-label">{current.eyebrow}</p>
          <h2>{current.heading}</h2>
          <p>{current.body}</p>
        </div>
      </div>
      {items.length > 1 && (
        <div className="intro-controls">
          <div className="intro-dots" role="group" aria-label="Chọn slide giới thiệu">
            {items.map((item, index) => (
              <button
                key={item._id}
                type="button"
                className={index === clampedActive ? 'is-active' : ''}
                onClick={() => goTo(index)}
                aria-label={`Xem slide giới thiệu ${index + 1}`}
                aria-pressed={index === clampedActive}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function HomePage() {
  const { categories } = useCategories()
  const [banners, setBanners] = useState<Banner[]>([])
  const [introSlides, setIntroSlides] = useState<IntroSlide[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<Banner[]>('/banners'),
      api<IntroSlide[]>('/intro-slides'),
      api<PaginatedResponse<Product>>('/products?featured=true&limit=3'),
      api<PaginatedResponse<Post>>('/posts?limit=2'),
    ])
      .then(([loadedBanners, loadedIntroSlides, loadedFeatured, loadedPosts]) => {
        setBanners(loadedBanners)
        setIntroSlides(loadedIntroSlides)
        setFeatured(loadedFeatured.items)
        setPosts(loadedPosts.items)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải trang chủ.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading label="Đang thắp sáng không gian…" />
  if (error) return <div className="shell page-space"><ErrorMessage message={error} /></div>

  return (
    <>
      <Hero banners={banners} />
      <Reveal as="div" className="home-intro-reveal">
        <IntroSlider slides={introSlides} />
      </Reveal>
      <Reveal as="section" className="shell section-space featured-section">
        <div className="section-heading"><div><p className="side-label">Được chọn nhiều</p><h2>Những nguồn sáng nổi bật</h2></div><Link className="text-link" to="/san-pham">Xem tất cả</Link></div>
        {featured.length ? <RevealStagger className="featured-grid">{featured.map((product) => <ProductCard key={product._id} product={product} featured />)}</RevealStagger> : <p>Những sản phẩm đầu tiên đang được hoàn thiện.</p>}
      </Reveal>
      {categories.length > 0 && (
        <Reveal as="section" className="category-strip">
          <div className="shell">
            <p className="side-label">Chọn theo nhu cầu</p>
            <div className="category-links">
              {categories.map((category) => (
                <Link key={category._id} to={`/san-pham?category=${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}
      <Reveal as="section" className="shell section-space journal-section">
        <div className="section-heading"><div><p className="side-label">Góc kể chuyện</p><h2>Ánh sáng trong nhà</h2></div><Link className="text-link" to="/bai-viet">Đọc tất cả</Link></div>
        <div className="post-grid">{posts.map((post) => <Link className="post-preview" key={post._id} to={`/bai-viet/${post.slug}`}><div className="post-image">{post.coverImage && <img src={post.coverImage} alt="" />}</div><div><p>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p><h3>{post.title}</h3><span>Đọc bài viết</span></div></Link>)}</div>
      </Reveal>
    </>
  )
}

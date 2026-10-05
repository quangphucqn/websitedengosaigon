import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { ProductCard } from '../components/ProductCard'
import { Reveal } from '../components/Reveal'
import { Seo } from '../components/Seo'
import { useCategories } from '../lib/categories'
import type { Banner, IntroSlide, PaginatedResponse, Post, Product } from '../types'

function Hero({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const dragDelta = useRef(0)
  const hasBanners = banners.length > 0

  useEffect(() => {
    if (banners.length < 2) return
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % banners.length),
      5000,
    )
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
      onPointerCancel={() => {
        touchStart.current = null
        dragDelta.current = 0
      }}
    >
      {hasBanners ? (
        <>
          <img
            key={banner._id}
            src={banner.imageUrl}
            alt={banner.title || 'Không gian Đèn Gỗ Sài Gòn — Đèn gỗ thủ công mỹ nghệ'}
            loading="eager"
            decoding="async"
          />
          <div className="hero-overlay" />
          <div className="shell hero-copy">
            <p className="hero-kicker">Đèn gỗ làm thủ công</p>
            <h1>{banner.title || 'Ánh sáng được làm để ở lại cùng không gian sống.'}</h1>
            <Link className="button button-light" to={banner.link || '/san-pham'}>
              Khám phá bộ sưu tập
            </Link>
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
            <Link className="button button-light" to="/san-pham">
              Khám phá bộ sưu tập
            </Link>
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
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % items.length),
      5000,
    )
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
      onPointerCancel={() => {
        touchStart.current = null
      }}
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

  const featuredRef = useRef<HTMLDivElement>(null)
  const postsRef = useRef<HTMLDivElement>(null)
  const [featuredScroll, setFeaturedScroll] = useState({ canLeft: false, canRight: false })
  const [postsScroll, setPostsScroll] = useState({ canLeft: false, canRight: false })

  const updateScrollState = useCallback(() => {
    if (featuredRef.current) {
      const el = featuredRef.current
      setFeaturedScroll({
        canLeft: el.scrollLeft > 6,
        canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 6,
      })
    }
    if (postsRef.current) {
      const el = postsRef.current
      setPostsScroll({
        canLeft: el.scrollLeft > 6,
        canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 6,
      })
    }
  }, [])

  useEffect(() => {
    Promise.all([
      api<Banner[]>('/banners'),
      api<IntroSlide[]>('/intro-slides'),
      api<PaginatedResponse<Product>>('/products?featured=true&limit=8'),
      api<PaginatedResponse<Post>>('/posts?limit=6'),
    ])
      .then(([loadedBanners, loadedIntroSlides, loadedFeatured, loadedPosts]) => {
        setBanners(loadedBanners)
        setIntroSlides(loadedIntroSlides)
        setFeatured(loadedFeatured.items)
        setPosts(loadedPosts.items)
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Không thể tải trang chủ.'),
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const fEl = featuredRef.current
    const pEl = postsRef.current

    updateScrollState()

    fEl?.addEventListener('scroll', updateScrollState, { passive: true })
    pEl?.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      fEl?.removeEventListener('scroll', updateScrollState)
      pEl?.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [featured.length, posts.length, updateScrollState])

  const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (!ref.current) return
    const firstChild = ref.current.firstElementChild as HTMLElement | null
    const amount = firstChild ? firstChild.offsetWidth + 22 : 320
    ref.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (loading) return <Loading label="Đang thắp sáng không gian…" />
  if (error) {
    return (
      <div className="shell page-space">
        <ErrorMessage message={error} />
      </div>
    )
  }

  return (
    <>
      <Seo
        title="Đèn Gỗ Sài Gòn — Đèn gỗ thủ công, ánh sáng ở lại"
        description="Xưởng sản xuất và thiết kế đèn gỗ thủ công tại Sài Gòn. Các dòng đèn bàn, đèn thả trần, đèn đứng, đèn ngủ gỗ tự nhiên mang ánh sáng ấm cúng cho không gian sống."
        canonical="/"
      />
      <Hero banners={banners} />
      <Reveal as="div" className="home-intro-reveal">
        <IntroSlider slides={introSlides} />
      </Reveal>

      {/* Featured Products Slider */}
      <Reveal as="section" className="shell section-space featured-section">
        <div className="section-heading">
          <div>
            <p className="side-label">Được chọn nhiều</p>
            <h2>Những nguồn sáng nổi bật</h2>
          </div>
          <div className="section-heading-actions">
            <Link className="text-link" to="/san-pham">
              Xem tất cả
            </Link>
            {featured.length > 2 && (
              <div className="slider-nav-buttons" role="group" aria-label="Điều hướng sản phẩm">
                <button
                  type="button"
                  className="slider-nav-btn"
                  onClick={() => scrollSlider(featuredRef, 'left')}
                  disabled={!featuredScroll.canLeft}
                  aria-label="Xem sản phẩm trước"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="slider-nav-btn"
                  onClick={() => scrollSlider(featuredRef, 'right')}
                  disabled={!featuredScroll.canRight}
                  aria-label="Xem sản phẩm tiếp theo"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {featured.length ? (
          <div
            ref={featuredRef}
            className="home-slider-track"
            tabIndex={0}
            aria-label="Dải sản phẩm nổi bật"
          >
            {featured.map((product) => (
              <div className="home-slider-item-product" key={product._id}>
                <ProductCard product={product} featured />
              </div>
            ))}
          </div>
        ) : (
          <p>Những sản phẩm đầu tiên đang được hoàn thiện.</p>
        )}
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

      {/* Journal / Articles Slider */}
      <Reveal as="section" className="shell section-space journal-section">
        <div className="section-heading">
          <div>
            <p className="side-label">Góc kể chuyện</p>
            <h2>Ánh sáng trong nhà</h2>
          </div>
          <div className="section-heading-actions">
            <Link className="text-link" to="/bai-viet">
              Đọc tất cả
            </Link>
            {posts.length > 2 && (
              <div className="slider-nav-buttons" role="group" aria-label="Điều hướng bài viết">
                <button
                  type="button"
                  className="slider-nav-btn"
                  onClick={() => scrollSlider(postsRef, 'left')}
                  disabled={!postsScroll.canLeft}
                  aria-label="Xem bài viết trước"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="slider-nav-btn"
                  onClick={() => scrollSlider(postsRef, 'right')}
                  disabled={!postsScroll.canRight}
                  aria-label="Xem bài viết tiếp theo"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          ref={postsRef}
          className="home-slider-track"
          tabIndex={0}
          aria-label="Dải bài viết mới"
        >
          {posts.map((post) => (
            <div className="home-slider-item-post" key={post._id}>
              <Link className="post-preview" to={`/bai-viet/${post.slug}`}>
                <div className="post-image">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <div>
                  <p>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                  <h3>{post.title}</h3>
                  <span>Đọc bài viết</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Reveal>
    </>
  )
}

import { ChevronDown, Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import { useCategories } from '../lib/categories'
import { Logo } from './Logo'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const { categories } = useCategories()
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  )

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [])

  const openProducts = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setProductOpen(true)
  }

  const scheduleCloseProducts = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setProductOpen(false), 140)
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav
          className={menuOpen ? 'main-nav is-open' : 'main-nav'}
          aria-label="Điều hướng chính"
        >
          <div
            className={`nav-item nav-dropdown ${productOpen ? 'is-open' : ''}`}
            onMouseEnter={openProducts}
            onMouseLeave={scheduleCloseProducts}
          >
            <button
              type="button"
              className="nav-dropdown-trigger nav-item-button"
              onClick={(event) => {
                event.preventDefault()
                setProductOpen((open) => !open)
              }}
              aria-expanded={productOpen}
              aria-haspopup="menu"
            >
              <span>Sản phẩm</span>
              <ChevronDown size={14} aria-hidden="true" className="nav-chevron" />
            </button>
            <div
              className="nav-dropdown-menu"
              role="menu"
              onMouseEnter={openProducts}
              onMouseLeave={scheduleCloseProducts}
            >
              <Link
                to="/san-pham"
                className="nav-dropdown-all"
                onClick={() => {
                  setMenuOpen(false)
                  setProductOpen(false)
                }}
              >
                Tất cả sản phẩm
              </Link>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/san-pham?category=${category.slug}`}
                  className="nav-dropdown-link"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    setProductOpen(false)
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/bai-viet" onClick={() => setMenuOpen(false)} className="nav-item">
            Blog
          </NavLink>
          <NavLink to="/lien-he" onClick={() => setMenuOpen(false)} className="nav-item">
            Liên hệ
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link
            className="cart-link"
            to="/gio-hang"
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
          >
            <ShoppingBag aria-hidden="true" size={20} />
            <span>Giỏ hàng</span>
            {count > 0 && <b>{count}</b>}
          </Link>
          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}

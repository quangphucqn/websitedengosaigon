import { Menu, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import { Logo } from './Logo'

const navItems = [
  { to: '/san-pham', label: 'Sản phẩm' },
  { to: '/bai-viet', label: 'Câu chuyện' },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <NavLink className="nav-admin" to="/admin/dang-nhap" onClick={() => setMenuOpen(false)}>
            Quản trị
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link className="cart-link" to="/gio-hang" aria-label={`Giỏ hàng, ${count} sản phẩm`}>
            <ShoppingBag aria-hidden="true" size={20} />
            <span>Giỏ</span>
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

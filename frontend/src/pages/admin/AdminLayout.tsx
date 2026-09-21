import { FilePenLine, FileText, Image as ImageIcon, Layers, LogOut, Mail, Package, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api, clearToken, getToken } from '../../api/client'
import { Logo } from '../../components/Logo'

const links = [
  { to: '/admin/san-pham', label: 'Sản phẩm', icon: Package },
  { to: '/admin/danh-muc', label: 'Loại đèn', icon: Layers },
  { to: '/admin/banner', label: 'Banner', icon: ImageIcon },
  { to: '/admin/gioi-thieu', label: 'Giới thiệu', icon: FilePenLine },
  { to: '/admin/bai-viet', label: 'Bài viết', icon: FileText },
  { to: '/admin/lien-he', label: 'Liên hệ', icon: Mail },
  { to: '/admin/don-hang', label: 'Đơn hàng', icon: ShoppingBag },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      navigate('/admin/dang-nhap')
      return
    }
    api('/auth/me')
      .then(() => setReady(true))
      .catch(() => navigate('/admin/dang-nhap'))
  }, [navigate])

  if (!ready) return <p className="loading">Đang kiểm tra phiên đăng nhập…</p>

  return (
    <div className="admin-shell">
      <aside>
        <Logo />
        <nav>
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink key={link.to} to={link.to}>
                <Icon size={18} aria-hidden="true" />
                {link.label}
              </NavLink>
            )
          })}
        </nav>
        <button type="button" onClick={() => { clearToken(); navigate('/admin/dang-nhap') }}>
          <LogOut size={18} aria-hidden="true" /> Đăng xuất
        </button>
      </aside>
      <section className="admin-main">
        <Outlet />
      </section>
    </div>
  )
}

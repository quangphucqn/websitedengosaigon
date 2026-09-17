import { AtSign, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p className="footer-intro">Những chiếc đèn gỗ được làm chậm rãi, để ánh sáng ở lại lâu hơn trong không gian của bạn.</p>
        </div>
        <div>
          <h2>Khám phá</h2>
          <Link to="/san-pham">Tất cả sản phẩm</Link>
          <Link to="/bai-viet">Góc kể chuyện</Link>
          <Link to="/gio-hang">Giỏ hàng</Link>
        </div>
        <div>
          <h2>Liên hệ</h2>
          <a href="mailto:hello@dengosaigon.vn"><Mail size={16} aria-hidden="true" /> hello@dengosaigon.vn</a>
          <p><MapPin size={16} aria-hidden="true" /> Thành phố Hồ Chí Minh</p>
          <a href="https://instagram.com" target="_blank" rel="noreferrer"><AtSign size={16} aria-hidden="true" /> Instagram</a>
        </div>
      </div>
      <div className="shell footer-bottom">© {new Date().getFullYear()} Đèn Gỗ Sài Gòn. Làm thủ công tại Việt Nam.</div>
    </footer>
  )
}

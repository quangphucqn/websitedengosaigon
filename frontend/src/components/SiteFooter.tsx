import {
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { useContact, normalizePhoneForTel, normalizeZaloLink } from '../store/contact'

export function SiteFooter() {
  const { contact } = useContact()
  const tel = normalizePhoneForTel(contact?.phone)
  const zaloHref = normalizeZaloLink(contact?.zalo)

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p className="footer-intro">
            {contact?.brandName ?? 'Đèn Gỗ Sài Gòn'} — những chiếc đèn gỗ được làm chậm rãi,
            để ánh sáng ở lại lâu hơn trong không gian của bạn.
          </p>
        </div>
        <div>
          <h2>Khám phá</h2>
          <Link to="/san-pham">Tất cả sản phẩm</Link>
          <Link to="/bai-viet">Góc kể chuyện</Link>
          <Link to="/gio-hang">Giỏ hàng</Link>
        </div>
        <div>
          <h2>Liên hệ</h2>
          {contact?.address && (
            <p>
              <MapPin size={16} aria-hidden="true" /> {contact.address}
            </p>
          )}
          {contact?.phone && (
            <a href={tel ? `tel:${tel}` : '#'}>
              <Phone size={16} aria-hidden="true" /> {contact.phone}
            </a>
          )}
          {contact?.email && (
            <a href={`mailto:${contact.email}`}>
              <Mail size={16} aria-hidden="true" /> {contact.email}
            </a>
          )}
          {contact?.zalo &&
            (zaloHref ? (
              <a href={zaloHref} target="_blank" rel="noreferrer">
                <MessageCircle size={16} aria-hidden="true" /> Zalo: {contact.zalo}
              </a>
            ) : (
              <p>
                <MessageCircle size={16} aria-hidden="true" /> Zalo: {contact.zalo}
              </p>
            ))}
          {contact?.facebook && (
            <a href={contact.facebook} target="_blank" rel="noreferrer">
              <Globe size={16} aria-hidden="true" /> Facebook
            </a>
          )}
          {contact?.instagram && (
            <a href={contact.instagram} target="_blank" rel="noreferrer">
              <Globe size={16} aria-hidden="true" /> Instagram
            </a>
          )}
          {contact?.workingHours && (
            <p>
              <Clock size={16} aria-hidden="true" /> {contact.workingHours}
            </p>
          )}
        </div>
      </div>
      <div className="shell footer-bottom">
        © {new Date().getFullYear()} {contact?.brandName ?? 'Đèn Gỗ Sài Gòn'}. Làm thủ công tại Việt Nam.
      </div>
    </footer>
  )
}

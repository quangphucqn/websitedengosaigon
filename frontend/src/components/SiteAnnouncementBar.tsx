import { MessageCircle, Phone, Truck } from 'lucide-react'
import { useContact, normalizePhoneForTel, normalizeZaloLink } from '../store/contact'

export function SiteAnnouncementBar() {
  const { contact } = useContact()
  const tel = normalizePhoneForTel(contact?.phone)
  const zaloHref = normalizeZaloLink(contact?.zalo)

  return (
    <div className="announcement-bar">
      <div className="shell announcement-inner">
        {/* Left */}
        <span className="announcement-item announcement-left">
          <Truck size={14} aria-hidden="true" />
          Giao hàng toàn quốc
        </span>

        {/* Center */}
        <span className="announcement-item announcement-center">
          100% làm thủ công — chất lượng bền vững
        </span>

        {/* Right */}
        <span className="announcement-item announcement-right">
          {contact?.phone && (
            <a href={tel ? `tel:${tel}` : '#'} className="announcement-link">
              <Phone size={14} aria-hidden="true" />
              {contact.phone}
            </a>
          )}
          {contact?.zalo && (
            <a href={zaloHref ?? '#'} target="_blank" rel="noreferrer" className="announcement-link announcement-zalo">
              <MessageCircle size={14} aria-hidden="true" />
              Zalo
            </a>
          )}
        </span>
      </div>
    </div>
  )
}

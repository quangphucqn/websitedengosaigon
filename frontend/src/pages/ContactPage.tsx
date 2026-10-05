import {
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { Seo } from '../components/Seo'
import { normalizePhoneForTel, normalizeZaloLink } from '../store/contact'
import type { ContactInfo } from '../types'

export function ContactPage() {
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<ContactInfo>('/contact')
      .then(setContact)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin liên hệ.'),
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  if (!contact) return <ErrorMessage message={error || 'Không có dữ liệu.'} />

  const tel = normalizePhoneForTel(contact.phone)
  const zaloHref = normalizeZaloLink(contact.zalo)

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: contact.brandName || 'Đèn Gỗ Sài Gòn',
    url: 'https://denthucong.site/lien-he',
    telephone: contact.phone,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address || '',
      addressLocality: 'Thành phố Hồ Chí Minh',
      addressCountry: 'VN',
    },
    openingHours: contact.workingHours,
    sameAs: [contact.facebook, contact.instagram, zaloHref].filter(Boolean),
  }

  return (
    <section className="page-space contact-page">
      <Seo
        title="Liên Hệ Xưởng Đèn Gỗ Sài Gòn — Địa Chỉ & Hotline"
        description="Ghé xưởng trải nghiệm đèn gỗ thủ công hoặc liên hệ đặt hàng theo yêu cầu tại TP.HCM. Hotline, Zalo và địa chỉ chi tiết."
        canonical="/lien-he"
        schema={localBusinessSchema}
      />
      <div className="shell">
        <header className="page-title">
          <p className="side-label">Liên hệ</p>
          <h1>{contact.brandName}</h1>
          <p>
            Ghé xưởng thử đèn, đặt hàng thủ công hoặc liên lạc với chúng tôi qua các kênh dưới đây.
          </p>
        </header>

        <div className="contact-grid">
          <div className="contact-info-card">
            <h2>Thông tin liên hệ</h2>
            <ul>
              {contact.address && (
                <li>
                  <MapPin size={20} aria-hidden="true" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li>
                  <Phone size={20} aria-hidden="true" />
                  <a href={tel ? `tel:${tel}` : '#'}>{contact.phone}</a>
                </li>
              )}
              {contact.email && (
                <li>
                  <Mail size={20} aria-hidden="true" />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              {contact.zalo && (
                <li>
                  <MessageCircle size={20} aria-hidden="true" />
                  {zaloHref ? (
                    <a href={zaloHref} target="_blank" rel="noreferrer">
                      Nhắn Zalo: {contact.zalo}
                    </a>
                  ) : (
                    <span>Zalo: {contact.zalo}</span>
                  )}
                </li>
              )}
              {contact.facebook && (
                <li>
                  <Globe size={20} aria-hidden="true" />
                  <a href={contact.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                </li>
              )}
              {contact.instagram && (
                <li>
                  <Globe size={20} aria-hidden="true" />
                  <a href={contact.instagram} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
              )}
              {contact.workingHours && (
                <li>
                  <Clock size={20} aria-hidden="true" />
                  <span>{contact.workingHours}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="contact-map-card">
            {contact.mapEmbedUrl ? (
              <iframe
                src={contact.mapEmbedUrl}
                title={`Bản đồ xưởng ${contact.brandName}`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="contact-map-placeholder">
                <MapPin size={36} aria-hidden="true" />
                <p>Bản đồ sẽ được hiển thị khi quản trị viên cập nhật.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

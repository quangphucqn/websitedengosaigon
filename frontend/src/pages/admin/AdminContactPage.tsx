import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { ErrorMessage, Loading } from '../../components/Loading'
import type { ContactInfo } from '../../types'

const empty: ContactInfo = {
  brandName: 'Đèn Gỗ Sài Gòn',
  address: '',
  phone: '',
  email: '',
  zalo: '',
  facebook: '',
  instagram: '',
  workingHours: '',
  mapEmbedUrl: '',
}

export function AdminContactPage() {
  const [form, setForm] = useState<ContactInfo>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () =>
    api<ContactInfo>('/contact')
      .then((data) => setForm({ ...empty, ...data }))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin liên hệ.'),
      )
      .finally(() => setLoading(false))

  useEffect(() => {
    void load()
  }, [])

  const update =
    (field: keyof ContactInfo) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const data = await api<ContactInfo>('/contact', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setForm({ ...empty, ...data })
      setSuccess('Đã lưu thông tin liên hệ.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu thông tin liên hệ.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="side-label">Trang chủ</p>
          <h1>Thông tin liên hệ</h1>
          <p>Hiển thị trên footer, trang Liên hệ và menu chính của website.</p>
        </div>
      </header>
      <form className="admin-form" onSubmit={submit}>
        <fieldset>
          <legend>Thông tin chung</legend>
          <div className="form-row">
            <label>
              Tên thương hiệu
              <input value={form.brandName} onChange={update('brandName')} required />
            </label>
            <label>
              Giờ mở cửa
              <input value={form.workingHours ?? ''} onChange={update('workingHours')} placeholder="VD: Thứ 2 – Thứ 7: 9:00 – 18:00" />
            </label>
            <label>
              Địa chỉ
              <input value={form.address ?? ''} onChange={update('address')} placeholder="Số nhà, đường, quận, thành phố" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Số điện thoại & Email</legend>
          <div className="form-row">
            <label>
              Số điện thoại
              <input value={form.phone ?? ''} onChange={update('phone')} placeholder="VD: 0901 234 567" />
            </label>
            <label>
              Email
              <input type="email" value={form.email ?? ''} onChange={update('email')} placeholder="hello@dengosaigon.vn" />
            </label>
            <label>
              Zalo (số điện thoại hoặc link)
              <input value={form.zalo ?? ''} onChange={update('zalo')} placeholder="VD: 0901234567 hoặc link zalo.me" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Mạng xã hội</legend>
          <div className="form-row">
            <label>
              Facebook (URL trang)
              <input value={form.facebook ?? ''} onChange={update('facebook')} placeholder="https://facebook.com/dengosaigon" />
            </label>
            <label>
              Instagram (URL trang)
              <input value={form.instagram ?? ''} onChange={update('instagram')} placeholder="https://instagram.com/dengosaigon" />
            </label>
            <label />
          </div>
        </fieldset>

        <fieldset>
          <legend>Bản đồ Google Maps</legend>
          <label>
            Link nhúng bản đồ (URL trong thuộc tính src hoặc mã iframe đầy đủ)
            <textarea
              rows={3}
              value={form.mapEmbedUrl ?? ''}
              onChange={update('mapEmbedUrl')}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <small style={{ color: 'var(--muted)', display: 'block', marginTop: 8, fontWeight: 400 }}>
              Vào Google Maps → Chia sẻ → Nhúng bản đồ → Sao chép <code>&lt;iframe&gt;</code> và dán vào đây.
              Hệ thống sẽ tự tách <code>src</code> để hiển thị. Bạn cũng có thể dán thẳng URL từ <code>src="..."</code>.
            </small>
          </label>
        </fieldset>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="button" type="submit" disabled={saving}>
            <Save size={16} aria-hidden="true" />
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
          {success && <span style={{ color: 'var(--olive)', fontSize: '.85rem' }}>{success}</span>}
        </div>
        {error && <ErrorMessage message={error} />}
      </form>
    </div>
  )
}

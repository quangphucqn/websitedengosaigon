import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, uploadImage } from '../../api/client'
import { FileInput } from '../../components/FileInput'
import { ErrorMessage, Loading } from '../../components/Loading'
import type { Banner } from '../../types'

function SortableBanner({ banner, onToggle, onRemove }: { banner: Banner; onToggle: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner._id })
  return (
    <article ref={setNodeRef} className="banner-row" style={{ transform: CSS.Transform.toString(transform), transition }}>
      <button className="drag-handle" type="button" {...attributes} {...listeners} aria-label="Kéo để đổi thứ tự"><GripVertical /></button>
      <img src={banner.imageUrl} alt="" />
      <div>
        <strong>{banner.title || 'Không có tiêu đề'}</strong>
        <p>{banner.link || 'Không có liên kết'}</p>
      </div>
      <label className="checkbox"><input type="checkbox" checked={banner.isActive} onChange={onToggle} /> Hiển thị</label>
      <button className="delete-button" type="button" onClick={onRemove}><Trash2 size={16} /> Xóa</button>
    </article>
  )
}

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('/san-pham')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const sensors = useSensors(useSensor(PointerSensor))

  const load = () => api<Banner[]>('/banners/admin/all').then(setBanners).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải banner.')).finally(() => setLoading(false))
  useEffect(() => { void load() }, [])

  const create = async () => {
    if (!file) { setError('Vui lòng chọn ảnh banner.'); return }
    try {
      const { url } = await uploadImage(file, 'banners')
      const created = await api<Banner>('/banners', { method: 'POST', body: JSON.stringify({ imageUrl: url, title, link, isActive: banners.filter((item) => item.isActive).length < 5 }) })
      setBanners((list) => [...list, created])
      setTitle(''); setLink('/san-pham'); setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm banner.')
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = banners.findIndex((item) => item._id === active.id)
    const newIndex = banners.findIndex((item) => item._id === over.id)
    const next = arrayMove(banners, oldIndex, newIndex)
    setBanners(next)
    await api('/banners/reorder', { method: 'PATCH', body: JSON.stringify({ ids: next.map((item) => item._id) }) })
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head"><div><p className="side-label">Trang chủ</p><h1>Banner slideshow</h1><p>Tối đa 5 banner đang hiển thị. Kéo thả để đổi thứ tự.</p></div></header>
      <form className="admin-form compact-form" onSubmit={(event) => { event.preventDefault(); void create() }}>
        <label>Tiêu đề (không bắt buộc)<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>Liên kết<input value={link} onChange={(event) => setLink(event.target.value)} /></label>
        <label className="file-input-label-wrap">
          <span className="file-input-label-text">Ảnh banner</span>
          <FileInput
            label="Ảnh banner (tỉ lệ 12:5)"
            accept="image/jpeg,image/png,image/webp"
            onSelect={(files) => setFile(files?.[0] ?? null)}
          />
          {file && (
            <div className="banner-preview" aria-label="Xem trước ảnh banner">
              <img src={URL.createObjectURL(file)} alt="Xem trước" />
            </div>
          )}
        </label>
        <button className="button" type="submit">Thêm banner</button>
      </form>
      {error && <ErrorMessage message={error} />}
      {loading ? <Loading /> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => { void onDragEnd(event) }}>
          <SortableContext items={banners.map((item) => item._id)} strategy={verticalListSortingStrategy}>
            <div className="banner-list">
              {banners.map((banner) => (
                <SortableBanner
                  key={banner._id}
                  banner={banner}
                  onToggle={() => { void api(`/banners/${banner._id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !banner.isActive }) }).then(() => setBanners((list) => list.map((item) => item._id === banner._id ? { ...item, isActive: !item.isActive } : item))).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể cập nhật banner.')) }}
                  onRemove={() => { if (!window.confirm('Xóa banner này?')) return; void api(`/banners/${banner._id}`, { method: 'DELETE' }).then(() => setBanners((list) => list.filter((item) => item._id !== banner._id))) }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

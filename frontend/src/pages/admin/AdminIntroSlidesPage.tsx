import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Plus, Trash2, GripVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { ErrorMessage, Loading } from '../../components/Loading'
import type { IntroSlide } from '../../types'

type FormValues = {
  eyebrow: string
  heading: string
  body: string
  isActive: boolean
}

const emptyForm: FormValues = {
  eyebrow: '',
  heading: '',
  body: '',
  isActive: true,
}

function SortableIntroSlide({
  slide,
  onEdit,
  onToggle,
  onRemove,
}: {
  slide: IntroSlide
  onEdit: () => void
  onToggle: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide._id })

  return (
    <article ref={setNodeRef} className="intro-slide-row" style={{ transform: CSS.Transform.toString(transform), transition }}>
      <button className="drag-handle" type="button" {...attributes} {...listeners} aria-label="Kéo để đổi thứ tự">
        <GripVertical size={18} />
      </button>
      <div className="intro-slide-row-copy">
        <p className="side-label">{slide.eyebrow || 'Không có nhãn'}</p>
        <h2>{slide.heading}</h2>
        <p>{slide.body}</p>
      </div>
      <span className={`tag ${slide.isActive ? 'tag-active' : 'tag-inactive'}`}>
        {slide.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
      </span>
      <div className="intro-slide-actions">
        <button type="button" onClick={onEdit} aria-label="Sửa">
          <Pencil size={16} />
        </button>
        <button type="button" onClick={onToggle} aria-label={slide.isActive ? 'Ẩn' : 'Hiển thị'}>
          {slide.isActive ? 'Ẩn' : 'Hiện'}
        </button>
        <button type="button" onClick={onRemove} aria-label="Xóa">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}

export function AdminIntroSlidesPage() {
  const [slides, setSlides] = useState<IntroSlide[]>([])
  const [editing, setEditing] = useState<IntroSlide | null>(null)
  const [form, setForm] = useState<FormValues>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const sensors = useSensors(useSensor(PointerSensor))

  const load = () => {
    setLoading(true)
    api<IntroSlide[]>('/intro-slides/admin/all')
      .then(setSlides)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải slide giới thiệu.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    void load()
  }, [])

  const update = (field: keyof FormValues, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setEditing(null)
    setForm(emptyForm)
  }

  const startEdit = (slide: IntroSlide) => {
    setEditing(slide)
    setForm({
      eyebrow: slide.eyebrow ?? '',
      heading: slide.heading,
      body: slide.body,
      isActive: slide.isActive,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        const updated = await api<IntroSlide>(`/intro-slides/${editing._id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        })
        setSlides((list) => list.map((slide) => (slide._id === updated._id ? updated : slide)))
      } else {
        const created = await api<IntroSlide>('/intro-slides', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        setSlides((list) => [...list, created])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu slide giới thiệu.')
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (slide: IntroSlide) => {
    setError('')
    try {
      const updated = await api<IntroSlide>(`/intro-slides/${slide._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !slide.isActive }),
      })
      setSlides((list) => list.map((item) => (item._id === updated._id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái slide.')
    }
  }

  const remove = async (slide: IntroSlide) => {
    if (!window.confirm(`Xóa slide "${slide.heading}"?`)) return
    setError('')
    try {
      await api(`/intro-slides/${slide._id}`, { method: 'DELETE' })
      setSlides((list) => list.filter((item) => item._id !== slide._id))
      if (editing?._id === slide._id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa slide giới thiệu.')
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slides.findIndex((slide) => slide._id === active.id)
    const newIndex = slides.findIndex((slide) => slide._id === over.id)
    const next = arrayMove(slides, oldIndex, newIndex)
    setSlides(next)
    try {
      await api('/intro-slides/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ ids: next.map((slide) => slide._id) }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đổi thứ tự slide.')
      load()
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="side-label">Trang chủ</p>
          <h1>Giới thiệu</h1>
          <p>Đoạn text chuyển cảnh nằm dưới banner trang chủ. Tối đa 5 slide đang hiển thị.</p>
        </div>
      </header>

      <form className="admin-form intro-slide-form" onSubmit={submit}>
        <h2>{editing ? 'Sửa slide giới thiệu' : 'Thêm slide giới thiệu'}</h2>
        <label>
          Nhãn nhỏ
          <input
            value={form.eyebrow}
            maxLength={40}
            onChange={(event) => update('eyebrow', event.target.value)}
            placeholder="VD: Từ xưởng nhỏ ở Sài Gòn"
          />
        </label>
        <label>
          Tiêu đề
          <textarea
            rows={3}
            value={form.heading}
            maxLength={160}
            onChange={(event) => update('heading', event.target.value)}
            required
          />
        </label>
        <label>
          Mô tả
          <textarea
            rows={3}
            value={form.body}
            maxLength={420}
            onChange={(event) => update('body', event.target.value)}
            required
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => update('isActive', event.target.checked)}
          />
          Hiển thị trên trang chủ
        </label>
        {error && <ErrorMessage message={error} />}
        <div className="admin-form-actions">
          <button className="button" type="submit" disabled={saving}>
            <Plus size={16} aria-hidden="true" />
            {saving ? 'Đang lưu…' : editing ? 'Cập nhật slide' : 'Thêm slide'}
          </button>
          {editing && (
            <button className="button-ghost" type="button" onClick={resetForm}>
              Hủy
            </button>
          )}
        </div>
      </form>

      {loading ? <Loading /> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => { void onDragEnd(event) }}>
          <SortableContext items={slides.map((slide) => slide._id)} strategy={verticalListSortingStrategy}>
            <div className="intro-slide-list">
              {slides.map((slide) => (
                <SortableIntroSlide
                  key={slide._id}
                  slide={slide}
                  onEdit={() => startEdit(slide)}
                  onToggle={() => { void toggle(slide) }}
                  onRemove={() => { void remove(slide) }}
                />
              ))}
              {slides.length === 0 && <p className="muted center">Chưa có slide giới thiệu nào.</p>}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

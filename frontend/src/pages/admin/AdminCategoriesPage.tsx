import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../api/client'
import { ErrorMessage, Loading } from '../../components/Loading'
import { slugify, useCategories } from '../../lib/categories'
import type { Category } from '../../types'

const schema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự.'),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu -'),
  description: z.string().trim().max(300).optional(),
  order: z.coerce.number().int().min(0),
  isActive: z.boolean(),
})

type FormInput = z.infer<typeof schema>

export function AdminCategoriesPage() {
  const { reload: reloadPublic } = useCategories()
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '', order: 0, isActive: true },
  })

  const nameValue = watch('name')

  const load = () => {
    setLoading(true)
    api<Category[]>('/categories/admin/all')
      .then(setCategories)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải loại đèn.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useEffect(() => {
    if (!editing) {
      setValue('slug', slugify(nameValue || ''))
    }
  }, [nameValue, editing, setValue])

  const startEdit = (category: Category) => {
    setEditing(category)
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      order: category.order,
      isActive: category.isActive,
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    reset({ name: '', slug: '', description: '', order: 0, isActive: true })
  }

  const submit = async (values: FormInput) => {
    setError('')
    try {
      if (editing) {
        await api(`/categories/${editing._id}`, { method: 'PATCH', body: JSON.stringify(values) })
      } else {
        await api('/categories', { method: 'POST', body: JSON.stringify(values) })
      }
      cancelEdit()
      load()
      reloadPublic()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu loại đèn.')
    }
  }

  const remove = async (category: Category) => {
    if (!window.confirm(`Xóa loại đèn "${category.name}"?`)) return
    try {
      await api(`/categories/${category._id}`, { method: 'DELETE' })
      setCategories((list) => list.filter((c) => c._id !== category._id))
      reloadPublic()
      if (editing?._id === category._id) cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa loại đèn.')
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="side-label">Quản lý</p>
          <h1>Loại đèn</h1>
        </div>
      </header>

      <div className="admin-categories-layout">
        <form className="admin-form admin-form-compact" onSubmit={handleSubmit(submit)} noValidate>
          <h2>{editing ? 'Sửa loại đèn' : 'Thêm loại đèn'}</h2>
          <label>
            Tên loại đèn
            <input {...register('name')} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>
          <label>
            Slug (URL thân thiện)
            <input {...register('slug')} />
            {errors.slug && <span className="field-error">{errors.slug.message}</span>}
          </label>
          <label>
            Mô tả
            <textarea rows={3} {...register('description')} />
          </label>
          <label>
            Thứ tự hiển thị
            <input type="number" {...register('order')} />
          </label>
          <label className="checkbox">
            <input type="checkbox" {...register('isActive')} /> Hiển thị trên cửa hàng
          </label>
          {error && <ErrorMessage message={error} />}
          <div className="admin-form-actions">
              <button className="button" disabled={isSubmitting} type="submit">
                <Plus size={16} aria-hidden="true" /> {editing ? 'Cập nhật' : 'Thêm loại đèn'}
              </button>
            {editing && (
              <button type="button" className="button-ghost" onClick={cancelEdit}>
                Hủy
              </button>
            )}
          </div>
        </form>

        <div className="admin-categories-list">
          {loading ? <Loading /> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className={editing?._id === category._id ? 'is-editing' : undefined}>
                    <td>
                      <strong>{category.name}</strong>
                      {category.description && <p className="muted small">{category.description}</p>}
                    </td>
                    <td><code>{category.slug}</code></td>
                    <td>{category.order}</td>
                    <td>
                      <span className={`tag ${category.isActive ? 'tag-active' : 'tag-inactive'}`}>
                        {category.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="table-actions">
                      <button type="button" onClick={() => startEdit(category)} aria-label="Sửa"><Pencil size={16} /></button>
                      <button type="button" onClick={() => remove(category)} aria-label="Xóa"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={5} className="muted center">Chưa có loại đèn nào.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

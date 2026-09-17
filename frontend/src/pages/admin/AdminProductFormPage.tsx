import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { api, uploadImage } from '../../api/client'
import { ErrorMessage } from '../../components/Loading'
import type { Product, ProductCategory } from '../../types'

const schema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự.'),
  description: z.string().trim().min(10, 'Mô tả tối thiểu 10 ký tự.'),
  price: z.coerce.number().int().min(0),
  category: z.enum(['den-ban', 'den-treo', 'den-dung', 'den-ngu']),
  stock: z.coerce.number().int().min(0),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
})

type FormInput = z.infer<typeof schema>

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', price: 0, category: 'den-ban', stock: 0, isFeatured: false, isPublished: true },
  })

  useEffect(() => {
    if (!id) return
    api<Product>(`/products/admin/${id}`).then((product) => {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        isFeatured: product.isFeatured,
        isPublished: product.isPublished,
      })
      setImages(product.images)
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.'))
  }, [id, reset])

  const onUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return
    try {
      const uploaded = await Promise.all([...fileList].map((file) => uploadImage(file, 'products')))
      setImages((list) => [...list, ...uploaded.map((item) => item.url)])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải ảnh lên.')
    }
  }

  const submit = async (values: FormInput) => {
    setError('')
    const payload = { ...values, images, category: values.category as ProductCategory }
    try {
      if (isEdit && id) await api(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      else await api('/products', { method: 'POST', body: JSON.stringify(payload) })
      navigate('/admin/san-pham')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu sản phẩm.')
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head"><div><p className="side-label">Sản phẩm</p><h1>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1></div></header>
      <form className="admin-form" onSubmit={handleSubmit(submit)} noValidate>
        <label>Tên sản phẩm<input {...register('name')} />{errors.name && <span className="field-error">{errors.name.message}</span>}</label>
        <label>Mô tả<textarea rows={5} {...register('description')} />{errors.description && <span className="field-error">{errors.description.message}</span>}</label>
        <div className="form-row">
          <label>Giá (VND)<input type="number" {...register('price')} /></label>
          <label>Tồn kho<input type="number" {...register('stock')} /></label>
          <label>Loại<select {...register('category')}><option value="den-ban">Đèn bàn</option><option value="den-treo">Đèn treo</option><option value="den-dung">Đèn đứng</option><option value="den-ngu">Đèn ngủ</option></select></label>
        </div>
        <label className="checkbox"><input type="checkbox" {...register('isFeatured')} /> Hiện ở mục sản phẩm nổi bật</label>
        <label className="checkbox"><input type="checkbox" {...register('isPublished')} /> Hiển thị trên cửa hàng (bỏ chọn để ẩn sản phẩm chưa có giá)</label>
        <fieldset>
          <legend>Ảnh sản phẩm</legend>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => onUpload(event.target.files)} />
          <div className="image-list">{images.map((url) => <div key={url}><img src={url} alt="" /><button type="button" onClick={() => setImages((list) => list.filter((item) => item !== url))}>Gỡ</button></div>)}</div>
        </fieldset>
        {error && <ErrorMessage message={error} />}
        <button className="button" disabled={isSubmitting} type="submit">{isSubmitting ? 'Đang lưu…' : 'Lưu sản phẩm'}</button>
      </form>
    </div>
  )
}

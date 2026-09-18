import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { api, uploadImage } from '../../api/client'
import { FileInput } from '../../components/FileInput'
import { ErrorMessage } from '../../components/Loading'
import { TipTapEditor } from '../../components/TipTapEditor'
import type { Post } from '../../types'

const schema = z.object({ title: z.string().trim().min(4, 'Tiêu đề tối thiểu 4 ký tự.'), coverImage: z.string(), isPublished: z.boolean() })
type FormInput = z.infer<typeof schema>

export function AdminPostFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState('<p></p>')
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormInput>({ resolver: zodResolver(schema), defaultValues: { title: '', coverImage: '', isPublished: false } })
  const coverImage = watch('coverImage')
  useEffect(() => {
    if (!id) return
    api<Post>(`/posts/admin/${id}`)
      .then((post) => {
        reset({ title: post.title, coverImage: post.coverImage, isPublished: post.isPublished })
        setContent(post.content)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải bài viết.'))
  }, [id, reset])
  const uploadCover = async (file: File | undefined) => { if (!file) return; try { const { url } = await uploadImage(file, 'posts'); setValue('coverImage', url) } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải ảnh lên.') } }
  const submit = async (values: FormInput) => { setError(''); try { const payload = { ...values, content, images: [] as string[] }; if (id) await api(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); else await api('/posts', { method: 'POST', body: JSON.stringify(payload) }); navigate('/admin/bai-viet') } catch (err) { setError(err instanceof Error ? err.message : 'Không thể lưu bài viết.') } }
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div><p className="side-label">Bài viết</p><h1>{id ? 'Sửa bài viết' : 'Viết bài mới'}</h1></div>
      </header>
      <form className="admin-form" onSubmit={handleSubmit(submit)} noValidate>
        <label>Tiêu đề<input {...register('title')} />{errors.title && <span className="field-error">{errors.title.message}</span>}</label>
        <div className="file-input-label-wrap">
          <span className="file-input-label-text">Ảnh bìa</span>
          <FileInput
            label="Ảnh bìa bài viết"
            accept="image/jpeg,image/png,image/webp"
            hint="Kích thước khuyến nghị: 1200 × 630 px (tỉ lệ 1.91:1 — chuẩn OG Image của Facebook). Hỗ trợ JPG/PNG/WebP."
            onSelect={(files) => { void uploadCover(files?.[0]) }}
          />
          {coverImage && <img className="cover-preview" src={coverImage} alt="Ảnh bìa đã chọn" />}
        </div>
        <label className="checkbox"><input type="checkbox" {...register('isPublished')} /> Công khai bài viết</label>
        <fieldset><legend>Nội dung</legend><TipTapEditor value={content} onChange={setContent} /></fieldset>
        {error && <ErrorMessage message={error} />}
        <button className="button" disabled={isSubmitting} type="submit">{isSubmitting ? 'Đang lưu…' : 'Lưu bài viết'}</button>
      </form>
    </div>
  )
}

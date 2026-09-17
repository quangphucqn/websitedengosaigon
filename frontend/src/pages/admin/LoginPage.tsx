import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { api, setToken } from '../../api/client'
import { Logo } from '../../components/Logo'

const schema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự.'),
})

type LoginInput = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(schema) })

  const submit = async (values: LoginInput) => {
    setError('')
    try {
      const result = await api<{ accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(values) })
      setToken(result.accessToken)
      navigate('/admin/san-pham')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập không thành công.')
    }
  }

  return (
    <div className="admin-login">
      <Logo />
      <form onSubmit={handleSubmit(submit)} noValidate>
        <p className="side-label">Trang quản trị</p>
        <h1>Đăng nhập</h1>
        <label>Email<input type="email" autoComplete="username" {...register('email')} />{errors.email && <span className="field-error">{errors.email.message}</span>}</label>
        <label>Mật khẩu<input type="password" autoComplete="current-password" {...register('password')} />{errors.password && <span className="field-error">{errors.password.message}</span>}</label>
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="button" disabled={isSubmitting} type="submit">{isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
    </div>
  )
}

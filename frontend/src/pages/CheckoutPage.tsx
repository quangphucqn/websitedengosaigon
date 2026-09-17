import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../lib/format'
import { checkoutSchema, type CheckoutInput } from '../lib/validation'
import { useCartStore } from '../store/cart'

export function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const clear = useCartStore((state) => state.clear)
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema) })
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const submit = async (values: CheckoutInput) => {
    setSubmitError('')
    try {
      const order = await api<{ _id: string }>('/orders', { method: 'POST', body: JSON.stringify({ ...values, items: items.map(({ productId, quantity }) => ({ productId, quantity })) }) })
      clear()
      navigate(`/dat-hang-thanh-cong?order=${order._id}`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể đặt hàng. Vui lòng thử lại.')
    }
  }

  if (!items.length) return <div className="shell page-space"><EmptyState title="Chưa có sản phẩm để đặt" body="Giỏ hàng cần có ít nhất một sản phẩm trước khi đặt hàng." actionTo="/san-pham" actionLabel="Chọn sản phẩm" /></div>
  return <div className="shell page-space checkout-page"><Link className="back-link" to="/gio-hang"><ArrowLeft size={17} aria-hidden="true" /> Quay lại giỏ hàng</Link><div className="checkout-layout"><form className="checkout-form" onSubmit={handleSubmit(submit)} noValidate><div className="page-title"><p className="side-label">Thông tin giao hàng</p><h1>Đặt hàng</h1><p>Điền thông tin để xưởng chuẩn bị đơn cho bạn.</p></div><label>Họ và tên<input autoComplete="name" {...register('customerName')} />{errors.customerName && <span className="field-error">{errors.customerName.message}</span>}</label><label>Số điện thoại<input autoComplete="tel" inputMode="tel" {...register('phone')} />{errors.phone && <span className="field-error">{errors.phone.message}</span>}</label><label>Địa chỉ giao hàng<textarea rows={3} autoComplete="street-address" {...register('address')} />{errors.address && <span className="field-error">{errors.address.message}</span>}</label><label>Ghi chú cho xưởng <small>(không bắt buộc)</small><textarea rows={3} placeholder="Ví dụ: gọi trước khi giao hàng" {...register('note')} />{errors.note && <span className="field-error">{errors.note.message}</span>}</label>{submitError && <p className="error-message" role="alert">{submitError}</p>}<button className="button" disabled={isSubmitting} type="submit">{isSubmitting ? 'Đang ghi nhận đơn…' : 'Đặt hàng'}</button><p className="secure-note"><LockKeyhole size={15} aria-hidden="true" /> Thông tin của bạn chỉ dùng để xử lý đơn hàng.</p></form><aside className="checkout-summary"><h2>Đơn hàng của bạn</h2>{items.map((item) => <div className="checkout-line" key={item.productId}><span>{item.name} <b>× {item.quantity}</b></span><strong>{formatMoney(item.price * item.quantity)}</strong></div>)}<div className="checkout-total"><span>Tổng tạm tính</span><strong>{formatMoney(total)}</strong></div></aside></div></div>
}

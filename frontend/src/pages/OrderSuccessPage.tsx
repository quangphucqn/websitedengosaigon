import { CheckCircle2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  return <div className="shell page-space"><section className="order-success"><CheckCircle2 size={54} aria-hidden="true" /><p className="side-label">Đơn đã được ghi nhận</p><h1>Đặt hàng thành công</h1><p>Cảm ơn bạn đã tin chọn Đèn Gỗ Sài Gòn. Xưởng sẽ liên hệ theo số điện thoại bạn cung cấp để xác nhận và sắp xếp giao hàng.</p>{orderId && <p className="order-code">Mã đơn của bạn: <strong>#{orderId.slice(-6).toUpperCase()}</strong></p>}<Link className="button" to="/san-pham">Tiếp tục xem đèn</Link></section></div>
}

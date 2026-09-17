import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../lib/format'
import { useCartStore } from '../store/cart'

export function CartPage() {
  const items = useCartStore((state) => state.items)
  const remove = useCartStore((state) => state.remove)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!items.length) return <div className="shell page-space"><EmptyState title="Giỏ hàng đang trống" body="Chọn một chiếc đèn để mang ánh sáng về không gian của bạn." actionTo="/san-pham" actionLabel="Xem sản phẩm" /></div>
  return <div className="shell page-space cart-page">
    <div className="page-title"><p className="side-label">Giỏ hàng</p><h1>Những chiếc đèn bạn đã chọn</h1></div>
    <div className="cart-layout"><section className="cart-items">{items.map((item) => <article className="cart-item" key={item.productId}><Link className="cart-image" to={`/san-pham/${item.slug}`}>{item.image ? <img src={item.image} alt="" /> : <div className="image-placeholder" />}</Link><div className="cart-item-copy"><Link to={`/san-pham/${item.slug}`}><h2>{item.name}</h2></Link><p>{formatMoney(item.price)}</p><div className="quantity-control"><button type="button" onClick={() => setQuantity(item.productId, item.quantity - 1)} aria-label={`Giảm số lượng ${item.name}`}><Minus size={15} aria-hidden="true" /></button><span>{item.quantity}</span><button type="button" onClick={() => setQuantity(item.productId, item.quantity + 1)} aria-label={`Tăng số lượng ${item.name}`}><Plus size={15} aria-hidden="true" /></button></div></div><div className="cart-item-end"><strong>{formatMoney(item.price * item.quantity)}</strong><button className="delete-button" type="button" onClick={() => remove(item.productId)} aria-label={`Xóa ${item.name}`}><Trash2 size={18} aria-hidden="true" /> Xóa</button></div></article>)}</section><aside className="cart-summary"><h2>Tóm tắt đơn hàng</h2><div><span>Tạm tính</span><strong>{formatMoney(total)}</strong></div><div><span>Phí vận chuyển</span><span>Sẽ thông báo sau</span></div><div className="cart-total"><span>Tổng tạm tính</span><strong>{formatMoney(total)}</strong></div><Link className="button" to="/thanh-toan">Tiến hành đặt hàng</Link><p>Chưa cần tạo tài khoản. Bạn điền thông tin giao hàng ở bước tiếp theo.</p></aside></div>
  </div>
}

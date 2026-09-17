import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { ErrorMessage, Loading } from '../../components/Loading'
import { formatDate, formatMoney, statusLabel } from '../../lib/format'
import type { Order, OrderStatus } from '../../types'

const statuses: OrderStatus[] = ['moi', 'dang_xu_ly', 'da_giao', 'da_huy']

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  useEffect(() => { api<Order[]>('/orders').then(setOrders).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải đơn hàng.')).finally(() => setLoading(false)) }, [])
  const setStatus = async (order: Order, status: OrderStatus) => { try { const updated = await api<Order>(`/orders/${order._id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setOrders((list) => list.map((item) => item._id === updated._id ? updated : item)) } catch (err) { setError(err instanceof Error ? err.message : 'Không thể đổi trạng thái.') } }
  return <div className="admin-page"><header className="admin-page-head"><div><p className="side-label">Quản lý</p><h1>Đơn hàng</h1></div></header>{error && <ErrorMessage message={error} />}{loading ? <Loading /> : <div className="order-list">{orders.length ? orders.map((order) => <article className="admin-order" key={order._id}><button className="order-summary" type="button" onClick={() => setExpanded((current) => current === order._id ? null : order._id)}><span><strong>#{order._id.slice(-6).toUpperCase()}</strong><small>{formatDate(order.createdAt)}</small></span><span>{order.customerName}<small>{order.phone}</small></span><strong>{formatMoney(order.totalAmount)}</strong><span className={`status status-${order.status}`}>{statusLabel[order.status]}</span><ChevronDown className={expanded === order._id ? 'is-open' : ''} size={18} /></button>{expanded === order._id && <div className="order-detail"><div><h2>Giao đến</h2><p><strong>{order.customerName}</strong><br />{order.phone}<br />{order.address}</p>{order.note && <p><em>Ghi chú: {order.note}</em></p>}</div><div><h2>Sản phẩm</h2>{order.items.map((item) => <p key={item.productId}>{item.name} × {item.quantity}<strong>{formatMoney(item.price * item.quantity)}</strong></p>)}</div><label>Trạng thái<select value={order.status} disabled={order.status === 'da_huy'} onChange={(event) => { void setStatus(order, event.target.value as OrderStatus) }}>{statuses.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}</select></label></div>}</article>) : <p>Chưa có đơn hàng nào.</p>}</div>}</div>
}

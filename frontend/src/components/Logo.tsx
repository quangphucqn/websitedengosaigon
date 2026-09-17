import { LampDesk } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Đèn Gỗ Sài Gòn – về trang chủ">
      <LampDesk aria-hidden="true" strokeWidth={1.6} />
      <span>
        Đèn Gỗ
        <strong>Sài Gòn</strong>
      </span>
    </Link>
  )
}

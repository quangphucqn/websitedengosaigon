import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  onPage: (p: number) => void
}

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="page-btn"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`page-btn${p === page ? ' is-active' : ''}`}
            onClick={() => onPage(p)}
            aria-label={`Trang ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="page-btn"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

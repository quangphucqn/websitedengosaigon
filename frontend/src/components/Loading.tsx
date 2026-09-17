export function Loading({ label = 'Đang tải…' }: { label?: string }) {
  return <p className="loading" role="status">{label}</p>
}

export function ErrorMessage({ message }: { message: string }) {
  return <p className="error-message" role="alert">{message}</p>
}

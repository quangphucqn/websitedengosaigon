import { File as FileIcon, ImagePlus, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface FileInputProps {
  label: string
  hint?: string
  accept?: string
  multiple?: boolean
  onSelect: (files: FileList | null) => void
}

export function FileInput({ label, hint, accept = 'image/*', multiple = false, onSelect }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pickedNames, setPickedNames] = useState<string[]>([])

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    const names = files ? Array.from(files).map((file) => file.name) : []
    setPickedNames(names)
    onSelect(files)
  }

  const open = () => inputRef.current?.click()

  return (
    <div className="file-input">
      <div className="file-input-row">
        <button type="button" className="file-input-button" onClick={open}>
          <Upload size={16} aria-hidden="true" />
          <span>{multiple ? 'Chọn nhiều tệp' : 'Chọn tệp'}</span>
        </button>
        <span className="file-input-label">{label}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="file-input-native"
        aria-label={label}
      />
      {pickedNames.length > 0 && (
        <ul className="file-input-list">
          {pickedNames.map((name) => (
            <li key={name}>
              <FileIcon size={14} aria-hidden="true" />
              <span>{name}</span>
            </li>
          ))}
          <li>
            <button type="button" className="file-input-clear" onClick={() => {
              setPickedNames([])
              if (inputRef.current) inputRef.current.value = ''
              onSelect(null)
            }}>
              <X size={14} aria-hidden="true" /> Bỏ chọn
            </button>
          </li>
        </ul>
      )}
      {hint && <small className="file-input-hint">{hint}</small>}
    </div>
  )
}

export function ImagePreviewGrid({ urls, onRemove }: { urls: string[]; onRemove?: (url: string) => void }) {
  if (urls.length === 0) return null
  return (
    <div className="image-preview-grid">
      {urls.map((url) => (
        <div key={url} className="image-preview-cell">
          <img src={url} alt="" />
          {onRemove && (
            <button type="button" className="image-preview-remove" onClick={() => onRemove(url)} aria-label="Xóa ảnh">
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
      <div className="image-preview-count">
        <ImagePlus size={14} aria-hidden="true" />
        {urls.length} ảnh
      </div>
    </div>
  )
}

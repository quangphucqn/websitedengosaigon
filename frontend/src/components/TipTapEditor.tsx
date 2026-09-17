import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { useEditor, EditorContent } from '@tiptap/react'
import { Bold, ImagePlus, Italic, List, ListOrdered, Redo2, Undo2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { uploadImage } from '../api/client'

export function TipTapEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return null
  const toggle = (action: () => void) => () => action()
  const upload = async (file: File) => {
    const { url } = await uploadImage(file, 'posts')
    editor.chain().focus().setImage({ src: url, alt: 'Ảnh bài viết' }).run()
  }

  return <div className="tiptap-editor"><div className="editor-toolbar"><button type="button" className={editor.isActive('bold') ? 'is-active' : ''} onClick={toggle(() => editor.chain().focus().toggleBold().run())} aria-label="In đậm"><Bold size={17} /></button><button type="button" className={editor.isActive('italic') ? 'is-active' : ''} onClick={toggle(() => editor.chain().focus().toggleItalic().run())} aria-label="In nghiêng"><Italic size={17} /></button><button type="button" className={editor.isActive('bulletList') ? 'is-active' : ''} onClick={toggle(() => editor.chain().focus().toggleBulletList().run())} aria-label="Danh sách"><List size={17} /></button><button type="button" className={editor.isActive('orderedList') ? 'is-active' : ''} onClick={toggle(() => editor.chain().focus().toggleOrderedList().run())} aria-label="Danh sách đánh số"><ListOrdered size={17} /></button><button type="button" onClick={() => inputRef.current?.click()} aria-label="Chèn ảnh"><ImagePlus size={17} /></button><button type="button" onClick={toggle(() => editor.chain().focus().undo().run())} aria-label="Hoàn tác"><Undo2 size={17} /></button><button type="button" onClick={toggle(() => editor.chain().focus().redo().run())} aria-label="Làm lại"><Redo2 size={17} /></button></div><EditorContent editor={editor} /><input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = '' }} /></div>
}

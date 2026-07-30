'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { logTopic } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { Upload as UploadIcon, FileText, CheckCircle2, X, ArrowRight } from 'lucide-react'

export default function UploadPage() {
  const { studentId } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover') }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.length > 0) setFiles(Array.from(e.dataTransfer.files)) }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files; if (f && f.length > 0) setFiles(Array.from(f)) }

  const handleUpload = async () => {
    if (files.length === 0 || !studentId) return
    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        const text = await file.text()
        const subject = file.name.split(/[._]/)[0] || 'Uploaded Notes'
        const topic = file.name.replace(/\.[^/.]+$/, '').substring(0, 80)
        const note = text.substring(0, 200) || `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`
        await logTopic(studentId, subject, topic, note)
      }
      setUploaded(true)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    }
    setUploading(false)
  }

  const reset = () => { setFiles([]); setUploaded(false); setUploading(false); setError('') }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text">Upload</h1>
        <p className="text-sm text-muted mt-1">Notes are extracted and logged into your academic memory</p>
      </div>

      {error && <div className="text-sm text-error mb-4">{error}</div>}

      {uploaded ? (
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <h2 className="text-sm font-semibold text-text">Upload complete</h2>
              <p className="text-xs text-muted">{files.length} file{files.length !== 1 ? 's' : ''} added</p>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-muted" />
                <span className="flex-1 text-text truncate">{f.name}</span>
                <span className="text-xs text-muted">{(f.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="btn btn-sm">Upload more</button>
            <a href="/memory" className="btn btn-primary btn-sm">View memory <ArrowRight className="w-3 h-3" /></a>
          </div>
        </div>
      ) : (
        <div className="max-w-lg">
          <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn('border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              dragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-divider')}>
            <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.pptx,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
            <UploadIcon className={cn('w-8 h-8 mx-auto mb-3', dragActive ? 'text-accent' : 'text-muted')} />
            <h3 className="text-sm font-medium text-text mb-1">{dragActive ? 'Drop files here' : 'Drag & drop notes'}</h3>
            <p className="text-xs text-muted mb-4">PDF, DOCX, TXT, MD, PPTX</p>
            <button className="btn btn-sm">Browse files</button>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text font-medium">{files.length} file{files.length !== 1 ? 's' : ''}</span>
                <button onClick={() => setFiles([])} className="text-xs text-muted hover:text-text"><X className="w-3 h-3" /></button>
              </div>
              <div className="space-y-2 mb-4">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-muted" />
                    <span className="flex-1 text-text truncate">{f.name}</span>
                    <span className="text-xs text-muted">{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted hover:text-error"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <button onClick={handleUpload} disabled={uploading} className="btn btn-primary w-full disabled:opacity-50">
                {uploading ? 'Processing...' : 'Log to memory'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

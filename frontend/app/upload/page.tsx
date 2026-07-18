'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useAuth } from '@/lib/auth'
import { logTopic } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { Upload, FileText, X, CheckCircle2, Loader2, Brain, BookOpen, ArrowRight, Sparkles } from 'lucide-react'

export default function UploadPage() {
  const { studentId } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover') }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false)
    if (e.dataTransfer.files?.length > 0) setFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (f && f.length > 0) setFiles(Array.from(f))
  }

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">Notes Upload</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            Upload your notes — text is extracted and logged into your academic memory
          </motion.p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-[var(--error)]">{error}</div>}

      <AnimatePresence mode="wait">
        {uploaded ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <GlassCard glow className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Upload complete!</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{files.length} file{files.length !== 1 ? 's' : ''} added to your academic memory</p>
              <div className="max-w-sm mx-auto space-y-3 mb-8">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)] text-sm">
                    <FileText className="w-4 h-4 text-[var(--accent-light)]" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3">
                <button onClick={reset} className="btn-secondary text-sm">Upload more</button>
                <button onClick={() => window.location.href = '/memory'} className="btn-primary text-sm">
                  View memory <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn('relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300',
                dragActive ? 'border-[var(--accent)] bg-[#1a73e8]/5' : 'border-[var(--border-primary)] hover:border-[var(--border-glow)] hover:bg-white/[0.02]')}>
              <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.pptx,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
              <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all', dragActive ? 'bg-[#1a73e8]/20 scale-110' : 'bg-white/[0.04]')}>
                <Upload className={cn('w-8 h-8 transition-colors', dragActive ? 'text-[var(--accent-light)]' : 'text-[var(--text-muted)]')} />
              </div>
              <h3 className="font-display text-lg font-bold mb-1">{dragActive ? 'Drop your files here' : 'Drag & drop your notes'}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">PDF, DOCX, TXT, MD, PPTX &mdash; text will be extracted</p>
              <button className="btn-secondary text-sm !pointer-events-auto">Browse files</button>
            </div>

            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard glow className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-lg">{files.length} file{files.length !== 1 ? 's' : ''} selected</h2>
                    <button onClick={() => setFiles([])} className="btn-ghost text-xs !p-1"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2 mb-4">
                    {files.map((f, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                        <FileText className="w-4 h-4 text-[var(--accent-light)]" />
                        <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{f.name}</div><div className="text-xs text-[var(--text-muted)]">{(f.size / 1024).toFixed(0)} KB</div></div>
                        <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-[var(--text-muted)] hover:text-[var(--error)]"><X className="w-4 h-4" /></button>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full text-sm !py-3 disabled:opacity-60">
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing notes...</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><Brain className="w-4 h-4" />Log to academic memory</span>
                    )}
                  </button>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

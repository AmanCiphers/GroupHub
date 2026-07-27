import { useCallback, useEffect, useRef, useState } from "react"
import { Download, FileIcon, Loader2, Trash2, Upload } from "lucide-react"
import { apiFetch, getStoredUser } from "@/lib/api"

const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
}

export default function FileManager({ projectId }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef(null)
  const user = getStoredUser()

  const loadFiles = useCallback(() => {
    if (!projectId) return
    apiFetch(`/api/v1/files/${projectId}`)
      .then((p) => setFiles(p.data.files || []))
      .catch(() => setError("Failed to load files"))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => { loadFiles() }, [loadFiles])

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File exceeds ${MAX_SIZE_MB} MB limit`)
      e.target.value = ""
      return
    }
    setUploading(true)
    setError("")
    const form = new FormData()
    form.append("file", file)
    try {
      await apiFetch(`/api/v1/files/${projectId}/upload`, {
        method: "POST",
        body: form,
        retryOnUnauthorized: true,
      })
      loadFiles()
    } catch (err) {
      setError(err.message || "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function handleDelete(fileId) {
    if (!confirm("Delete this file?")) return
    try {
      await apiFetch(`/api/v1/files/${projectId}/${fileId}`, { method: "DELETE" })
      setFiles((prev) => prev.filter((f) => f._id !== fileId))
    } catch {}
  }

  return (
    <div className="border border-[#d9d8d2]">
      <div className="flex items-center justify-between border-b border-[#d9d8d2] bg-[#fbfbfa] px-5 py-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">
            Project Files
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[#999890]">Max {MAX_SIZE_MB} MB per file</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-9 items-center gap-2 bg-[#171717] px-4 text-sm font-black text-white transition hover:bg-[#2f2f2d] disabled:opacity-40"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input ref={inputRef} type="file" onChange={handleUpload} className="hidden" />
      </div>

      {error && (
        <p className="border-b border-[#d9d8d2] bg-red-50 px-5 py-2 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="divide-y divide-[#d9d8d2]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-[#77766f]" />
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center">
            <FileIcon className="mx-auto size-10 text-[#d9d8d2]" />
            <p className="mt-3 text-sm font-semibold text-[#77766f]">No files yet. Upload the first one!</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file._id} className="flex items-center gap-4 px-5 py-3 transition hover:bg-[#fbfbfa]">
              <FileIcon className="size-8 shrink-0 text-[#77766f]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[#171717]">{file.originalName}</p>
                <p className="text-xs font-semibold text-[#999890]">
                  {formatSize(file.size)} &middot; {formatDate(file.createdAt)}
                  {file.uploadedBy?.fullName && ` by ${file.uploadedBy.fullName}`}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={file.cloudinaryUrl}
                  className="flex size-9 items-center justify-center border border-[#d9d8d2] transition hover:bg-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="size-4" />
                </a>
                {file.uploadedBy?._id === user?.id && (
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="flex size-9 items-center justify-center border border-[#d9d8d2] transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

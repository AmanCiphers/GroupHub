import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { connectSocket, getSocket } from "@/lib/socket"
import { getStoredUser } from "@/lib/api"

export default function ChatRoom({ conversationId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const initialLoad = useRef(true)
  const user = getStoredUser()

  useEffect(() => {
    inputRef.current?.blur()
  }, [])

  const loadMessages = useCallback(() => {
    if (!conversationId) return
    setLoading(true)
    apiFetch(`/api/v1/chat/conversations/${conversationId}/messages`)
      .then((p) => {
        setMessages(p.data.messages || [])
        initialLoad.current = false
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [conversationId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  useEffect(() => {
    if (!conversationId || !user) return
    const socket = connectSocket()
    socket.on("connect", () => {
      socket.emit("join:conversation", conversationId)
    })
    if (socket.connected) {
      socket.emit("join:conversation", conversationId)
    }

    const onNewMessage = (msg) => {
      setMessages((prev) => {
        const updated = [msg, ...prev]
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }))
        return updated
      })
    }
    socket.on("message:new", onNewMessage)
    socket.emit("message:markRead", { conversationId })

    return () => {
      socket.off("message:new", onNewMessage)
      socket.emit("leave:conversation", conversationId)
    }
  }, [conversationId, user])

  useEffect(() => {
    if (!initialLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const socket = getSocket()
    if (socket?.connected) {
      socket.emit("message:send", { conversationId, text: text.trim() }, () => {
        setText("")
        setSending(false)
      })
    } else {
      try {
        await apiFetch(`/api/v1/chat/conversations/${conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({ text: text.trim() }),
        })
        setText("")
        await loadMessages()
      } catch {} finally {
        setSending(false)
      }
    }
  }

  const sorted = [...messages].reverse()

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-[#77766f]" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-[#77766f]">
            No messages yet. Start the conversation!
          </p>
        ) : (
          sorted.map((msg, i) => {
            const isOwn = msg.senderId?._id === user?.id
            const prev = sorted[i - 1]
            const showAvatar = !isOwn && msg.senderId?._id !== prev?.senderId?._id
            const showTime = !isOwn && msg.senderId?._id !== sorted[i + 1]?.senderId?._id

            return (
              <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-0.5"}`}>
                {!isOwn && (
                  <div className={`mr-2 flex shrink-0 items-end ${showAvatar ? "" : "invisible"}`}>
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#2f2f2d] text-xs font-black text-white">
                      {(msg.senderId?.fullName || "?").split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </div>
                  </div>
                )}
                <div className={`flex max-w-[70%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
                  {showAvatar && !isOwn && (
                    <p className="mb-1 ml-1 text-xs font-black uppercase tracking-[0.1em] text-[#77766f]">
                      {msg.senderId?.fullName || "Unknown"}
                    </p>
                  )}
                  <div
                    className={`w-fit rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn
                        ? "rounded-br-md bg-[#171717] text-white"
                        : "rounded-bl-md border border-[#d9d8d2] bg-white text-[#171717]"
                    }`}
                  >
                    <p className="font-medium">{msg.text}</p>
                  </div>
                  {(showTime || isOwn) && (
                    <p className={`mt-0.5 text-[11px] font-semibold text-[#999890] ${isOwn ? "mr-1" : "ml-1"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#d9d8d2] bg-[#fbfbfa] px-4 py-3">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="h-10 flex-1 rounded-full border border-[#d9d8d2] bg-white px-4 text-sm font-medium outline-none transition focus:border-[#171717]"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white transition hover:bg-[#2f2f2d] disabled:opacity-30"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}

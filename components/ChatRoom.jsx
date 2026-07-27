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
  const user = getStoredUser()

  const loadMessages = useCallback(() => {
    if (!conversationId) return
    setLoading(true)
    apiFetch(`/api/v1/chat/conversations/${conversationId}/messages`)
      .then((p) => setMessages(p.data.messages || []))
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
      setMessages((prev) => [msg, ...prev])
    }
    socket.on("message:new", onNewMessage)
    socket.emit("message:markRead", { conversationId })

    return () => {
      socket.off("message:new", onNewMessage)
      socket.emit("leave:conversation", conversationId)
    }
  }, [conversationId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
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
          sorted.map((msg) => (
            <div key={msg._id} className={`flex ${msg.senderId?._id === user?.id ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                  msg.senderId?._id === user?.id
                    ? "bg-[#171717] text-white"
                    : "border border-[#d9d8d2] bg-white text-[#171717]"
                }`}
              >
                {msg.senderId?._id !== user?.id && (
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.1em] text-[#77766f]">
                    {msg.senderId?.fullName || "Unknown"}
                  </p>
                )}
                <p className="font-semibold leading-relaxed">{msg.text}</p>
                <p className="mt-1 text-xs text-[#77766f]/60">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#d9d8d2] p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="h-10 flex-1 border border-[#d9d8d2] bg-white px-3 text-sm font-semibold outline-none focus:border-[#171717]"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex size-10 items-center justify-center bg-[#171717] text-white disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}

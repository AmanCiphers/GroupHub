"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, MessageSquare, Plus, Users } from "lucide-react"
import { apiFetch } from "@/lib/api"
import ChatRoom from "@/components/ChatRoom"

export default function InboxPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeConversation, setActiveConversation] = useState(null)
  const [members, setMembers] = useState([])
  const [showNewDM, setShowNewDM] = useState(false)

  useEffect(() => {
    apiFetch("/api/v1/chat/conversations")
      .then((p) => setConversations(p.data.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function startDM(userId) {
    try {
      const p = await apiFetch(`/api/v1/chat/conversations/dm/${userId}`, { method: "POST" })
      setActiveConversation(p.data.conversation._id)
      setShowNewDM(false)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="flex size-10 items-center justify-center border border-[#d9d8d2] bg-white">
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-2xl font-black">Messages</h1>
          </div>
          <button onClick={() => setShowNewDM(!showNewDM)} className="flex h-10 items-center gap-2 bg-[#171717] px-4 text-sm font-black text-white">
            <Plus className="size-4" />
            New Message
          </button>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="border border-[#d9d8d2] bg-[#fbfbfa]">
            <div className="border-b border-[#d9d8d2] p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">Conversations</h2>
            </div>
            <div className="divide-y divide-[#d9d8d2]">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="size-5 animate-spin text-[#77766f]" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="p-6 text-center text-sm font-semibold text-[#77766f]">No conversations yet.</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setActiveConversation(c._id)}
                    className={`w-full p-4 text-left transition hover:bg-white ${activeConversation === c._id ? "bg-white" : ""}`}
                  >
                    <p className="text-sm font-black">
                      {c.type === "project"
                        ? `# ${c.projectId?.title || "Project"}`
                        : c.participants?.map((p) => p.fullName).filter(Boolean).join(", ") || "DM"}
                    </p>
                    {c.lastMessage && (
                      <p className="mt-1 truncate text-sm font-semibold text-[#77766f]">
                        {c.lastMessage.senderId?.fullName}: {c.lastMessage.text}
                      </p>
                    )}
                    {c.unreadCount > 0 && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-[#171717] px-2 py-0.5 text-xs font-black text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            {activeConversation ? (
              <div className="h-[600px] border border-[#d9d8d2]">
                <ChatRoom conversationId={activeConversation} />
              </div>
            ) : (
              <div className="flex h-[600px] items-center justify-center border border-[#d9d8d2] bg-[#fbfbfa]">
                <div className="text-center">
                  <MessageSquare className="mx-auto size-12 text-[#d9d8d2]" />
                  <p className="mt-4 font-semibold text-[#77766f]">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

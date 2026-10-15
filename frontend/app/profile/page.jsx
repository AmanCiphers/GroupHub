"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { PageHeader } from "@/components/page-header"
import { Field } from "@/components/field"
import { ArrowRight, User, Mail } from "lucide-react"

/** Profile page: view and edit user profile (UI only). */
export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Profile"
        title={user ? `Hi, ${user.name}` : "Your Profile"}
        description="View and edit your profile details."
      />

      <section className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-xl border border-line bg-surface p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black">Profile Details</h2>
            <button
              onClick={() => setIsEditing((p) => !p)}
              className="text-sm font-black underline underline-offset-4"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {isEditing ? (
            <form className="space-y-4">
              <Field
                icon={User}
                id="name"
                label="Full name"
                value={form.name}
                onChange={update("name")}
              />
              <Field
                icon={Mail}
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={update("email")}
              />
              <button
                type="button"
                className="flex h-11 items-center gap-2 bg-ink px-5 text-sm font-black text-white"
              >
                Save Changes
                <ArrowRight className="size-4" />
              </button>
              <p className="text-xs text-faint">
                * Backend not wired here. UI only.
              </p>
            </form>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-faint">Name</p>
                <p className="font-semibold">{user?.name || "—"}</p>
              </div>
              <div>
                <p className="text-faint">Email</p>
                <p className="font-semibold">{user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-faint">Role</p>
                <p className="font-semibold">{user?.role || "user"}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

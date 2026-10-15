"use client"

import { useState } from "react"
import { CheckCircle, Mail, MapPin, MessageSquare, Send } from "lucide-react"
import { Field } from "@/components/field"

import { PageHeader } from "@/components/page-header"
import { contactMethods, faqs } from "@/lib/data/contact.data"

/** Contact page: methods + simple contact form. */
export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Contact"
        title="Tell us what would make collaboration easier."
        description="Questions, feedback, project support, or partnership ideas. Send it over and we'll route it to the right place."
      />

      <section className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 md:grid-cols-3">
          {contactMethods.map(([Icon, title, value, description]) => (
            <div key={title} className="border border-line bg-surface p-5">
              <Icon className="size-5" />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-1 text-sm font-black text-ink">{value}</p>
              <p className="mt-3 font-semibold text-subtle">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="text-3xl font-black">Send a message</h2>
            <p className="mt-2 font-semibold text-subtle">
              We&apos;ll get back to you with a useful answer, not a canned one.
            </p>

            {submitted ? (
              <div className="mt-8 border border-ink bg-white p-8">
                <CheckCircle className="size-10" />
                <h3 className="mt-5 text-2xl font-black">Message sent.</h3>
                <p className="mt-2 font-semibold text-subtle">
                  Thanks for reaching out. We&apos;ll reply soon.
                </p>
                <button className="mt-6 h-11 border border-ink px-5 text-sm font-black" onClick={() => setSubmitted(false)}>
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="firstName" label="First name" placeholder="John" />
                  <Field id="lastName" label="Last name" placeholder="Doe" />
                </div>
                <Field id="email" label="Email" type="email" placeholder="john@example.com" />
                <Field id="subject" label="Subject" placeholder="How can we help?" />
                <label htmlFor="message" className="block">
                  <span className="text-sm font-black">Message</span>
                  <textarea
                    id="message"
                    className="mt-2 min-h-40 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                    placeholder="Tell us more..."
                    required
                  />
                </label>
                <button className="inline-flex h-11 w-fit items-center gap-2 bg-ink px-5 text-sm font-black text-white">
                  Send message
                  <Send className="size-4" />
                </button>
              </form>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-black">Quick answers</h2>
            <div className="mt-8 grid gap-3">
              {faqs.map(([question, answer]) => (
                <div key={question} className="border border-line bg-white p-5">
                  <h3 className="font-black">{question}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-subtle">
                    {answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


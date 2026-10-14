"use client"

import { useState } from "react"
import { CheckCircle, Mail, MapPin, MessageSquare, Send } from "lucide-react"

const contactMethods = [
  [Mail, "Email", "hello@grouphub.com", "Send product questions or partnership notes."],
  [MessageSquare, "Support", "9am-5pm EST", "Get help with projects, profiles, and applications."],
  [MapPin, "Office", "San Francisco, CA", "A small team building for global collaborators."],
]

const faqs = [
  ["How do I create a project?", "Go to Dashboard, create a project, define the first milestone, and list the open roles you need."],
  ["Is GroupHub free to use?", "The current student and individual experience is free while the product is being shaped."],
  ["How does skill matching work?", "Matching compares project roles, skills, stage, and availability signals."],
  ["Can I join multiple projects?", "Yes, as long as your availability and team responsibilities stay realistic."],
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              Contact
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] sm:text-6xl">
              Tell us what would make collaboration easier.
            </h1>
          </div>
          <p className="text-lg font-semibold leading-snug text-[#55544f]">
            Questions, feedback, project support, or partnership ideas. Send it
            over and we&apos;ll route it to the right place.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 md:grid-cols-3">
          {contactMethods.map(([Icon, title, value, description]) => (
            <div key={title} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <Icon className="size-5" />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-1 text-sm font-black text-[#171717]">{value}</p>
              <p className="mt-3 font-semibold text-[#55544f]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="text-3xl font-black">Send a message</h2>
            <p className="mt-2 font-semibold text-[#55544f]">
              We&apos;ll get back to you with a useful answer, not a canned one.
            </p>

            {submitted ? (
              <div className="mt-8 border border-[#171717] bg-white p-8">
                <CheckCircle className="size-10" />
                <h3 className="mt-5 text-2xl font-black">Message sent.</h3>
                <p className="mt-2 font-semibold text-[#55544f]">
                  Thanks for reaching out. We&apos;ll reply soon.
                </p>
                <button className="mt-6 h-11 border border-[#171717] px-5 text-sm font-black" onClick={() => setSubmitted(false)}>
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
                    className="mt-2 min-h-40 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]"
                    placeholder="Tell us more..."
                    required
                  />
                </label>
                <button className="inline-flex h-11 w-fit items-center gap-2 bg-[#171717] px-5 text-sm font-black text-white">
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
                <div key={question} className="border border-[#d9d8d2] bg-white p-5">
                  <h3 className="font-black">{question}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#55544f]">
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

function Field({ id, label, type = "text", placeholder }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-black">{label}</span>
      <input
        id={id}
        type={type}
        className="mt-2 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
        placeholder={placeholder}
        required
      />
    </label>
  )
}

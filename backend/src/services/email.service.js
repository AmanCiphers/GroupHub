const { env } = require("../config/env")

async function sendVerificationEmail({ to, token }) {
  const clientUrl = env.CLIENT_URL || "http://localhost:3000"
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`

  if (!env.RESEND_API_SECRET) {
    console.log(`[DEV] Verification link for ${to}: ${verifyUrl}`)
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || "noreply@grouphub.app",
      to,
      subject: "Verify your email — GroupHub",
      html: [
        '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">',
        `<h1 style="font-size:24px;margin:0 0 8px">Verify your email</h1>`,
        `<p style="color:#555;line-height:1.5">Click the button below to verify your email address and start using GroupHub.</p>`,
        `<a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#171717;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Verify email</a>`,
        `<p style="color:#999;font-size:13px">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>`,
        `</div>`,
      ].join(""),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`[EMAIL] Failed to send verification email: ${res.status} ${body}`)
  }
}

const emailService = { sendVerificationEmail }
module.exports = { emailService }

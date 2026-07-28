const { env } = require("../config/env")

function emailLayout(body) {
  return [
    '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">',
    '<div style="border:1px solid #e5e3dc;padding:32px;background:#fbfbfa">',
    '<p style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;color:#62615d;margin:0 0 4px">GroupHub</p>',
    body,
    '</div>',
    '<p style="font-size:12px;color:#999890;margin-top:16px;text-align:center">GroupHub &middot; Build what you couldn&apos;t alone</p>',
    '</div>',
  ].join("")
}

function button(href, label) {
  return `<a href="${href}" style="display:inline-block;margin:20px 0 16px;padding:12px 28px;background:#171717;color:#fff;text-decoration:none;font-weight:700;font-size:14px;border-radius:4px">${label}</a>`
}

async function sendVerificationEmail({ to, token, fullName }) {
  const clientUrl = env.CLIENT_URL || "http://localhost:3000"
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`

  if (!env.RESEND_API_SECRET) {
    console.log(`[DEV] Verification link for ${to}: ${verifyUrl}`)
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "noreply@grouphub.app",
        to,
        subject: `Welcome to GroupHub, ${fullName}! Verify your email`,
        html: emailLayout([
          `<h1 style="font-size:22px;margin:16px 0 8px;color:#171717">Welcome aboard, ${fullName}!</h1>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px">You're one click away from joining a community of builders. Click the button below to verify your email and start collaborating.</p>`,
          button(verifyUrl, "Verify your email"),
          `<p style="color:#999890;font-size:13px;margin:0">This link expires in 24 hours. If you didn't sign up for GroupHub, you can safely ignore this email.</p>`,
        ].join("")),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[EMAIL] Failed to send verification email: ${res.status} ${body}`)
    }
  } catch (error) {
    console.error(`[EMAIL] Network error sending verification email:`, error)
  }
}

async function sendPasswordResetEmail({ to, token }) {
  const clientUrl = env.CLIENT_URL || "http://localhost:3000"
  const resetUrl = `${clientUrl}/reset-password?token=${token}`

  if (!env.RESEND_API_SECRET) {
    console.log(`[DEV] Password reset link for ${to}: ${resetUrl}`)
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "noreply@grouphub.app",
        to,
        subject: "Reset your password — GroupHub",
        html: emailLayout([
          '<h1 style="font-size:22px;margin:16px 0 8px;color:#171717">Reset your password</h1>',
          '<p style="color:#55544f;line-height:1.6;margin:0 0 4px">We received a request to reset the password for your GroupHub account. Click the button below to set a new one.</p>',
          button(resetUrl, "Reset password"),
          '<p style="color:#999890;font-size:13px;margin:0">This link expires in 1 hour. If you didn\'t request a password reset, you can safely ignore this email.</p>',
        ].join("")),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[EMAIL] Failed to send password reset email: ${res.status} ${body}`)
    }
  } catch (error) {
    console.error(`[EMAIL] Network error sending password reset email:`, error)
  }
}

async function sendApplicationSubmittedEmail({ to, applicantName, projectTitle, projectId, roleTitle }) {
  const clientUrl = env.CLIENT_URL || "http://localhost:3000"

  if (!env.RESEND_API_SECRET) {
    console.log(`[DEV] Application submitted email for ${to}: ${applicantName} applied for ${roleTitle} on ${projectTitle}`)
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "noreply@grouphub.app",
        to,
        subject: `New application for ${roleTitle} — ${projectTitle}`,
        html: emailLayout([
          `<h1 style="font-size:22px;margin:16px 0 8px;color:#171717">New applicant for your project</h1>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px"><strong>${applicantName}</strong> has applied for the <strong>${roleTitle}</strong> role on <strong>${projectTitle}</strong>.</p>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px">Review their application and decide whether to accept or decline.</p>`,
          button(`${clientUrl}/projects/${projectId}/manage`, "Review applications"),
          `<p style="color:#999890;font-size:13px;margin:0">You can also view all applications from your project dashboard.</p>`,
        ].join("")),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[EMAIL] Failed to send application email: ${res.status} ${body}`)
    }
  } catch (error) {
    console.error(`[EMAIL] Network error sending application email:`, error)
  }
}

async function sendApplicationAcceptedEmail({ to, applicantName, projectTitle, projectId, roleTitle }) {
  const clientUrl = env.CLIENT_URL || "http://localhost:3000"

  if (!env.RESEND_API_SECRET) {
    console.log(`[DEV] Application accepted email for ${to}: ${applicantName} was accepted for ${roleTitle} on ${projectTitle}`)
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "noreply@grouphub.app",
        to,
        subject: `You're in! Accepted for ${roleTitle} on ${projectTitle}`,
        html: emailLayout([
          `<h1 style="font-size:22px;margin:16px 0 8px;color:#171717">Congratulations, ${applicantName}!</h1>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px">Your application for <strong>${roleTitle}</strong> on <strong>${projectTitle}</strong> has been accepted.</p>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px">Head over to the project to introduce yourself, check the task board, and start collaborating with the team.</p>`,
          button(`${clientUrl}/projects/${projectId}/member`, "Go to project"),
          `<p style="color:#999890;font-size:13px;margin:0">Welcome to the team — we're excited to build with you!</p>`,
        ].join("")),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[EMAIL] Failed to send acceptance email: ${res.status} ${body}`)
    }
  } catch (error) {
    console.error(`[EMAIL] Network error sending acceptance email:`, error)
  }
}

async function sendTaskAssignedEmail({ to, assigneeName, taskTitle, projectTitle, projectId }) {
  const clientUrl = env.CLIENT_URL || "http://localhost:3000"

  if (!env.RESEND_API_SECRET) {
    console.log(`[DEV] Task assigned email for ${to}: ${taskTitle} assigned to ${assigneeName} on ${projectTitle}`)
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "noreply@grouphub.app",
        to,
        subject: `New task assigned: ${taskTitle} — ${projectTitle}`,
        html: emailLayout([
          `<h1 style="font-size:22px;margin:16px 0 8px;color:#171717">A new task is waiting for you</h1>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px">You've been assigned <strong>${taskTitle}</strong> on <strong>${projectTitle}</strong>.</p>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px">Log in to view the details, deadline, and get started.</p>`,
          button(`${clientUrl}/projects/${projectId}/manage`, "View task"),
          `<p style="color:#999890;font-size:13px;margin:0">Keep up the great work!</p>`,
        ].join("")),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[EMAIL] Failed to send task assignment email: ${res.status} ${body}`)
    }
  } catch (error) {
    console.error(`[EMAIL] Network error sending task assignment email:`, error)
  }
}

async function sendTaskNeedsReviewEmail({ to, ownerName, taskTitle, projectTitle, projectId }) {
  const clientUrl = env.CLIENT_URL || "http://localhost:3000"

  if (!env.RESEND_API_SECRET) {
    console.log(`[DEV] Task needs review email for ${to}: ${taskTitle} submitted for review on ${projectTitle}`)
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "noreply@grouphub.app",
        to,
        subject: `Task ready for review: ${taskTitle} — ${projectTitle}`,
        html: emailLayout([
          `<h1 style="font-size:22px;margin:16px 0 8px;color:#171717">A task is ready for your review</h1>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px"><strong>${taskTitle}</strong> on <strong>${projectTitle}</strong> has been submitted for review.</p>`,
          `<p style="color:#55544f;line-height:1.6;margin:0 0 4px">Log in to review the work, approve it, or request changes.</p>`,
          button(`${clientUrl}/projects/${projectId}/manage`, "Review task"),
          `<p style="color:#999890;font-size:13px;margin:0">Staying on top of reviews keeps the team moving forward.</p>`,
        ].join("")),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[EMAIL] Failed to send review notification email: ${res.status} ${body}`)
    }
  } catch (error) {
    console.error(`[EMAIL] Network error sending review notification email:`, error)
  }
}

const emailService = { sendApplicationAcceptedEmail, sendApplicationSubmittedEmail, sendPasswordResetEmail, sendTaskAssignedEmail, sendTaskNeedsReviewEmail, sendVerificationEmail }
module.exports = { emailService }

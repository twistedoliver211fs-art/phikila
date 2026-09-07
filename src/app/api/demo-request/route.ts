import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/html";

const CALENDLY_URL = "https://calendly.com/twistedoliver211fs/30min";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phikila-app.vercel.app";
const TEAM_INBOX = process.env.DEMO_NOTIFY_EMAIL ?? "omixsystems@gmail.com";

function buildEmailHtml(name: string, schoolName: string) {
  const safeName = escapeHtml(name);
  const safeSchool = escapeHtml(schoolName);
  const demoEmail = escapeHtml(process.env.DEMO_EMAIL ?? "demo@phikila.app");
  const demoPassword = process.env.DEMO_PASSWORD;
  const credentialsBlock = demoPassword
    ? `
      <div style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;padding:20px;margin:0 0 24px;">
        <h3 style="font-size:14px;font-weight:600;color:#374151;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Demo login</h3>
        <p style="color:#374151;font-size:14px;margin:0 0 8px;">Email: <code>${demoEmail}</code></p>
        <p style="color:#374151;font-size:14px;margin:0;">Password: <code>${escapeHtml(demoPassword)}</code></p>
      </div>`
    : `
      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Visit <a href="${SITE_URL}/demo">the demo page</a> to explore Phikila with sample data.
      </p>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:700;color:#4F46E5;margin:0;">Phikila</h1>
      <p style="color:#6b7280;font-size:14px;margin:4px 0 0;">School Management System</p>
    </div>
    <div style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="font-size:22px;font-weight:600;color:#111827;margin:0 0 8px;">Welcome to Phikila, ${safeName}!</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Thank you for your interest in Phikila for <strong>${safeSchool}</strong>.
      </p>
      ${credentialsBlock}
      <div style="text-align:center;margin:0 0 24px;">
        <a href="${SITE_URL}/login" style="display:inline-block;background:#4F46E5;color:#ffffff;font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
          Open Phikila
        </a>
      </div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <div style="text-align:center;">
        <h3 style="font-size:16px;font-weight:600;color:#111827;margin:0 0 8px;">Want a personalized walkthrough?</h3>
        <a href="${CALENDLY_URL}" style="display:inline-block;background:#059669;color:#ffffff;font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
          Book a Live Demo
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  const rl = rateLimit(request, { maxRequests: 3, windowMs: 300_000, prefix: "demo-request" });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many demo requests. Please try again in 5 minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({ error: "Demo requests are not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, school, role, message } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof school !== "string"
    ) {
      return NextResponse.json(
        { error: "Name, email, phone, and school name are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 200) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Your Phikila Demo is Ready — ${school.slice(0, 80)}`,
      html: buildEmailHtml(name.slice(0, 80), school.slice(0, 120)),
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: TEAM_INBOX,
      subject: `New Demo Request: ${escapeHtml(school.slice(0, 80))}`,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:16px;">
  <h2>New Demo Request</h2>
  <table style="border-collapse:collapse;width:100%;max-width:500px;">
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(name)}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(email)}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(phone)}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">School</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(school)}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Role</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(role || "Not specified")}</td></tr>
    ${message ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(message)}</td></tr>` : ""}
  </table>
</body>
</html>`,
    });

    return NextResponse.json({
      ok: true,
      message: "Demo request submitted. Check your email for next steps.",
    });
  } catch (error) {
    console.error("[demo-request] Error:", error);
    return NextResponse.json(
      { error: "Failed to process demo request" },
      { status: 500 }
    );
  }
}

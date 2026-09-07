import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

const DEMO_CREDENTIALS = {
  email: "demo@phikila.app",
  password: "Demo1234!",
  schoolName: "Phikila Demo Academy",
};

const CALENDLY_URL = "https://calendly.com/twistedoliver211fs/30min";
const DEMO_VIDEO_URL = "#"; // Placeholder — replace with actual video URL

function buildEmailHtml(name: string, schoolName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:700;color:#4F46E5;margin:0;">Phikila</h1>
      <p style="color:#6b7280;font-size:14px;margin:4px 0 0;">School Management System</p>
    </div>

    <!-- Main Card -->
    <div style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="font-size:22px;font-weight:600;color:#111827;margin:0 0 8px;">Welcome to Phikila, ${name}! 🎉</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Thank you for your interest in Phikila for <strong>${schoolName}</strong>. 
        We've set up a demo school so you can explore the platform with real sample data.
      </p>

      <!-- Demo Credentials -->
      <div style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;padding:20px;margin:0 0 24px;">
        <h3 style="font-size:14px;font-weight:600;color:#374151;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">🔐 Demo Login Credentials</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Email:</td>
            <td style="padding:4px 0;color:#111827;font-size:14px;font-family:monospace;background:#eef2ff;padding:4px 8px;border-radius:4px;">${DEMO_CREDENTIALS.email}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Password:</td>
            <td style="padding:4px 0;color:#111827;font-size:14px;font-family:monospace;background:#eef2ff;padding:4px 8px;border-radius:4px;">${DEMO_CREDENTIALS.password}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">School:</td>
            <td style="padding:4px 0;color:#111827;font-size:14px;">${DEMO_CREDENTIALS.schoolName}</td>
          </tr>
        </table>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align:center;margin:0 0 24px;">
        <a href="https://phikila-app.vercel.app/login" style="display:inline-block;background:#4F46E5;color:#ffffff;font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;margin:0 8px 8px 0;">
          Open Demo →
        </a>
        <a href="${DEMO_VIDEO_URL}" style="display:inline-block;background:#ffffff;color:#4F46E5;font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;border:2px solid #4F46E5;text-decoration:none;margin:0 8px 8px 0;">
          Watch Video Tour
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

      <!-- Schedule Live Demo -->
      <div style="text-align:center;">
        <h3 style="font-size:16px;font-weight:600;color:#111827;margin:0 0 8px;">Want a personalized walkthrough?</h3>
        <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">
          Book a 30-minute live demo with our team. We'll show you exactly how Phikila works for your school.
        </p>
        <a href="${CALENDLY_URL}" style="display:inline-block;background:#059669;color:#ffffff;font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
          📅 Book a Live Demo
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Questions? Reply to this email or WhatsApp us at
        <a href="https://wa.me/254768214649" style="color:#4F46E5;text-decoration:none;">+254 768 214 649</a>
      </p>
      <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">
        © 2026 Omix Digital Solutions. All rights reserved.
      </p>
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

  try {
    const body = await request.json();
    const { name, email, phone, school, role, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !school) {
      return NextResponse.json(
        { error: "Name, email, phone, and school name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send demo credentials email to the requester
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Your Phikila Demo is Ready — ${school}`,
      html: buildEmailHtml(name, school),
    });

    // Send notification to your team
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "omixsystems@gmail.com",
      subject: `🎓 New Demo Request: ${school}`,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:16px;">
  <h2>New Demo Request</h2>
  <table style="border-collapse:collapse;width:100%;max-width:500px;">
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">School</td><td style="padding:8px;border-bottom:1px solid #eee;">${school}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Role</td><td style="padding:8px;border-bottom:1px solid #eee;">${role || "Not specified"}</td></tr>
    ${message ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message}</td></tr>` : ""}
  </table>
  <p style="margin-top:16px;"><a href="https://phikila-app.vercel.app/login">Log in to view demo school →</a></p>
</body>
</html>`,
    });

    return NextResponse.json({
      ok: true,
      message: "Demo request submitted. Check your email for login credentials.",
    });
  } catch (error) {
    console.error("[demo-request] Error:", error);
    return NextResponse.json(
      { error: "Failed to process demo request" },
      { status: 500 }
    );
  }
}

🚀 HackathonHub

HackathonHub is a full-stack web platform designed to simplify hackathon management, student participation tracking, analytics visualization, AI mentoring, and resume generation.

It provides:

Admins with powerful tools to manage hackathons and analyze engagement

Students with dashboards to track participation, earn certificates, and build professional resumes using AI

✨ Core Modules
🛠 Admin Panel

Create and manage hackathons & events

Track event lifecycle:

Draft

Live

Completed

View participant count per event

Admin analytics dashboard with bar charts

Secure event ownership (createdBy based filtering)

🎓 Student Dashboard

Register for hackathons

QR-based attendance marking

View participation history

Download certificates

Engagement score calculation

AI-powered student mentor feedback

Visual analytics using charts

JWT-based authentication

📄 Resume Builder

Interactive resume creation form

Add and manage:

Skills

Projects (AI-generated descriptions)

Experience

Certifications (file upload support)

Achievements

Languages

AI-powered content generation using Gemini API

Export resume as a clean, professional PDF

ATS-friendly formatting

💳 Hackathon Payment Module

Optional paid registration per hackathon

Admin controls:

Enable / disable payments

Set entry fee per event

Student flow:

View entry fee before registration

Secure payment during registration

Payment validation before confirmation

Payment status tracking in database

Prevents duplicate or unpaid registrations

Designed to support future payment gateway integrations (e.g., Razorpay – test mode)

🤖 Artificial Intelligence (AI)

Powered by Google Gemini API:

AI-generated project descriptions

AI-generated experience descriptions

RAG-based implementation for contextual responses

AI Student Mentor insights

Resume content optimization (ATS-friendly)

📊 Analytics & Visualization

Pie Charts – student participation insights

Bar Charts – admin event & participant analytics

Built using Recharts

Fully responsive dashboards

🔐 QR-Based Attendance & Certificate System
📌 QR Code Generation

A unique QR code is generated for every hackathon/event

Encodes event-specific and user-specific information securely

📲 QR-Based Attendance

Participants scan the QR code during the event

On successful scan:

Attendance is marked automatically

Duplicate or invalid scans are prevented

🧾 Automatic Certificate Generation

After verified attendance:

A digital certificate (PDF) is generated dynamically

Includes participant name, event details, and unique verification ID

📧 Certificate Delivery via Email

Certificates are:

Stored securely in the system

Automatically sent to the participant’s registered email

Students can also download certificates anytime from their dashboard

✅ Certificate Verification

Each certificate contains a QR code

Scanning the QR code redirects to a public verification page

Confirms authenticity of the certificate

🧰 Tech Stack
Frontend

Next.js (App Router)

TypeScript

Tailwind CSS

Recharts

Backend

Next.js API Routes

MongoDB

Mongoose ODM

Utilities

Google Gemini API

PDF-Lib (Resume & Certificate PDF generation)

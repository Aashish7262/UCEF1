# HackathonHub

HackathonHub is a full-stack web application that simplifies **hackathon management, student participation tracking, analytics visualization, AI mentoring, and resume generation**.

The platform is designed for **admins to manage events** and **students to track progress**, while also providing **AI-powered insights and professional resume building**.

---

  Core Modules

 Admin Panel
- Create and manage hackathons & events
- Track event status (draft, live, completed)
- View participant count per event
- Admin analytics dashboard with bar charts
- Secure event ownership (createdBy based filtering)

 Student Dashboard
- Register & attend hackathons
- View participation history
- JWT based authentication
- Download certificates
- Engagement score calculation
- AI-powered student mentor feedback
- Visual analytics using charts

Resume Builder
- Interactive resume form
- Add:
  - Skills
  - Projects (AI-generated descriptions)
  - Experience
  - Certifications (file upload support)
  - Achievements & languages
- AI-powered content using Gemini API
- Export resume as a clean, professional PDF

---


  Hackathon Payment Module
- Optional paid registration per hackathon
- Admin controls:
  - Enable/disable payments
  - Set entry fee
- Student flow:
  - View entry fee before registration
  - Secure payment during registration
  - Payment validation before confirmation
- Payment status tracking in database
- Prevents duplicate or unpaid registrations

> Designed to support future integrations (Razorpay test mode)

---

 Artificial Intelligence
Powered by Google Gemini API:
- Project description generation
- RAG BASED IMPLEMENTAATION
- Experience description generation
- AI Student Mentor insights
- Resume content optimization (ATS-friendly)

---

 📊 Analytics
- **Pie Charts** – student participation analytics
- **Bar Charts** – admin event & participant analytics
- Built using **Recharts**
- Fully responsive dashboards

---

 Tech Stack

 Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts

 Backend
- Next.js API Routes
- MongoDB
- Mongoose ODM

Utilities
- Google Gemini API
- PDF-Lib (Resume PDF generation)

---

## 📁 Folder Structure


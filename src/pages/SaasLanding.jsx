/* src/pages/SaasLanding.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { Building2, BriefcaseBusiness, Binoculars } from "lucide-react";
import styles from "./SaasLanding.module.css";
import EP1 from "../assets/landing_page_thumbnails/EP1.png";
import EP2 from "../assets/landing_page_thumbnails/EP2.png";
import EP3 from "../assets/landing_page_thumbnails/EP3.png";
import EP4 from "../assets/landing_page_thumbnails/EP4.png";
import EP5 from "../assets/landing_page_thumbnails/EP5.png";
import EP6 from "../assets/landing_page_thumbnails/EP6.png";
import EP7 from "../assets/landing_page_thumbnails/EP7.png";
import EP8 from "../assets/landing_page_thumbnails/EP8.png";
import EP9 from "../assets/landing_page_thumbnails/EP9.png";
import EP10 from "../assets/landing_page_thumbnails/EP10.png";
import EP11 from "../assets/landing_page_thumbnails/EP11.png";
import EP12 from "../assets/landing_page_thumbnails/EP12.png";
import EP13 from "../assets/landing_page_thumbnails/EP13.png";
import EP14 from "../assets/landing_page_thumbnails/EP14.png";
import EP15 from "../assets/landing_page_thumbnails/EP15.png";
import EP16 from "../assets/landing_page_thumbnails/EP16.png";
import EP17 from "../assets/landing_page_thumbnails/EP17.png";
import EP18 from "../assets/landing_page_thumbnails/EP18.png";
import EP19 from "../assets/landing_page_thumbnails/EP19.png";
import EP20 from "../assets/landing_page_thumbnails/EP20.png";
import EP21 from "../assets/landing_page_thumbnails/EP21.png";
import EP22 from "../assets/landing_page_thumbnails/EP22.png";
import EP23 from "../assets/landing_page_thumbnails/EP23.png";
import EP24 from "../assets/landing_page_thumbnails/EP24.png";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CURRENT_VERSION = 24;

const EPISODES = [
    {
        num: 24,
        title: "Thank You for Watching — Build in Public Series Complete",
        thumb: EP24,
        url: "https://www.linkedin.com/posts/daneahern_ep24-building-ryzeai-the-final-episode-ugcPost-7466110725019631616-I-AA/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "For three months I set my alarm for 2:00 AM every morning to build my own ATS from scratch. EP24 is the final episode of the build-in-public series — and the beginning of something else. RYZE.ai is now a working recruiting platform: AI-powered candidate and job matching, a full booking system, Zoom + Calendar integration, conversational database search, branded profiles with PDF export, Stripe billing, and multi-tenant architecture. The next chapter is using it — launching a recruiting business for accounting and finance professionals, and building the pipeline to prove the platform works.",
    },
    {
        num: 23,
        title: "Media Queries & Mobile Responsiveness",
        thumb: EP23,
        url: "https://www.linkedin.com/posts/daneahern_title-ep23-media-queries-mobile-responsiveness-ugcPost-7462429012812992512-BmJT?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "The original goal was polishing the PDF exports for Employer Profiles and Job Orders. Pulled them up, took a look — they already looked great. Nothing to fix. What followed was a full sweep of the application for mobile responsiveness, page by page, with desktop on the left and iPhone Mirroring on the right. Employer Profile, Job Order Detail, Job Order Roster, Employer Roster, the RYZE Intelligence chat page — each one tightened up with media queries until it looked right on both screens.  Looking great.",
    },
    {
        num: 22,
        title: "Styling the Job Order UI & PDF Export",
        thumb: EP22,
        url: "https://www.linkedin.com/posts/daneahern_ep22-styling-the-job-order-ui-pdf-export-ugcPost-7460564507652739072-30AL?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "The job order detail page got the full employer profile treatment — full-width banner image, logo overlapping the edge, identity zone with title and meta sitting cleanly below it. When Harbor Financial Group uploaded their banner, it showed up on their job order page automatically. Clicking an open role on the Employer Profile now navigates directly to the job order — and from the job order, the employer profile link was already there. Full two-way navigation. The PDF got the same polish pass: banner height up, identity zone card removed, Recruiter Notes accent changed from mustard yellow to navy. The PDF now mirrors the UI.",
    },
    {
        num: 21,
        title: "Job Orders Admin UI + PDF Exports",
        thumb: EP21,
        url: "https://www.linkedin.com/posts/daneahern_ep21-job-orders-admin-ui-pdf-exports-ugcPost-7458825320306036737-UbTV?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Built the complete recruiter job order workflow in one episode — roster, create form with AI parsing, detail page, inline editing, status management, and one-click branded PDF export. The AI parser takes raw job posting text pasted from anywhere and extracts the title, location, salary range, and requirements automatically. PDF exports now work for both Job Orders and Employer Profiles, downloadable in one click from the admin panel. PDF generation runs server-side via Playwright.",
    },
    {
        num: 20,
        title: "Recruiter Workflow & Employer Profile PDF",
        thumb: EP20,
        url: "https://www.linkedin.com/posts/daneahern_ep20-of-building-ryzeai-in-public-walked-ugcPost-7458086260092518400-Pg4b?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Walked through the full recruiter workflow from booking through employer profile setup, then shipped branded PDF exports for employer profiles — downloadable in one click from the admin panel. Built with Python, FastAPI, PostgreSQL, and React. pgvector powers the AI candidate matching underneath.",
    },
    {
        num: 19,
        title: "Employer Profile & Self-Profile",
        thumb: EP19,
        url: "https://www.linkedin.com/posts/daneahern_ep-19-building-a-recruiting-platform-in-ugcPost-7457725762259812352-GcL-?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "EP18 gave candidates a branded profile. EP19 closes the triangle for employers. Company profiles now have a logo upload, banner image, and the same identity-zone layout — all stored in DigitalOcean Spaces. Employers log in and see their own profile page with editable company info, AI-generated overview, hiring needs, and talking points. A bug hiding in plain sight: the Alembic migration had added the columns to the database, but they were never added to the SQLAlchemy model — so every upload silently saved to Spaces and then vanished. One fix. Everything persists.",
    },
    {
        num: 18,
        title: "Candidate Profile",
        thumb: EP18,
        url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-in-public-ep18-candidate-ugcPost-7455551630424567808-tATF?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "EP17 built the billing layer. EP18 makes the platform look like something worth paying for. Candidate profiles rebuilt with a branded banner, headshot upload stored in DigitalOcean Spaces, and a hero layout with name and title overlaid directly on the banner. Experience and education restructured from AI-generated paragraphs into scannable bullet points. One-click PDF export — Playwright renders a fully branded recruiter-grade profile ready to send to a hiring manager.",
    },
    {
        num: 17,
        title: "Invite System, Free Trial & Stripe Billing",
        thumb: EP17,
        url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-in-public-ep17-invitation-ugcPost-7448296134080348160-e8rh?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "EP16 proved the walls hold. EP17 opened the doors. Admin invite flow onboards any recruiting firm in one action — tenant created, 30-day trial started, branded welcome email fired. Stripe handles the full billing lifecycle from trial to paying subscriber. A firm goes from zero to paying customer in under 5 minutes.",
    },
    {
        num: 16,
        title: "Multi-Tenant Architecture Testing",
        thumb: EP16,
        url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-in-public-ep16-before-ugcPost-7445042623633018880-dQcM?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Before opening RYZE to real recruiters, the multi-tenant isolation layer gets a full stress test. Every table carries a tenant_id column. Every query filters by the authenticated user's tenant. Cross-tenant data access blocked and verified end-to-end. The walls hold.",
    },
    {
        num: 15,
        title: "AI Candidate & Employer Matching",
        thumb: EP15,
        url: "https://www.linkedin.com/in/daneahern/",
        desc: "The dashboards go live with real intelligence. Candidate and employer dashboards now show AI-powered matches using pgvector cosine similarity — candidates see job opportunities ranked by fit, employers see ranked candidate suggestions for every open position. The static placeholders are gone.",
    },
    {
        num: 14,
        title: "Candidate & Employer Dashboards",
        thumb: EP14,
        url: "https://www.linkedin.com/posts/daneahern_ep14-of-building-ryzeai-candidate-and-ugcPost-7444089991846121474-ixgX?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Built out the Candidate and Employer dashboards end-to-end — with static data first. Candidates see their profile, upcoming calls, and open job opportunities. Employers see their company brief, linked job orders, and candidate activity. Getting the structure and layout right before wiring in live AI matching in the next episode.",
    },
    {
        num: 13,
        title: "Fixing the Zoom Webhook — Getting the Transcript",
        thumb: EP13,
        url: "https://www.linkedin.com/posts/daneahern_episode-13-fixing-the-zoom-webhook-getting-ugcPost-7442718641017511936-FK50?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Zoom fires three separate events after a meeting ends — and they don't all arrive at the same time. My webhook was only listening to the first two. The third one — recording.transcript_completed — was arriving, getting logged as 'unhandled event,' and doing nothing. One new handler. One bug fix on where Zoom puts the download token. Deploy. Test. 1946 chars saved to the database.",
    },
    {
        num: 12,
        title: "The DB Explorer — A Tool That Became a Feature",
        thumb: EP12,
        url: "https://www.linkedin.com/posts/daneahern_i-built-the-db-explorer-as-a-debugging-tool-activity-7441418508527226880-Qs3o?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "I built the DB Explorer as a personal debugging tool — a way to see exactly what was in my database without writing SQL by hand. It worked so well I kept using it every day. So I shipped it. Browse any table, search, sort, filter by date, edit records inline, jump between related records by foreign key, see embedding status, and export to CSV. A utility that became a permanent feature.",
    },
    {
        num: 11,
        title: "Does the AI Actually Learn?",
        thumb: EP11,
        url: "https://www.linkedin.com/posts/daneahern_episode-11-of-building-ryze-this-is-bob-activity-7440383984909340672-ilXO?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Bob Callahan is finishing his accounting degree at night while working construction during the day. I played both roles — recruiter and candidate — on a real Zoom call. Then I asked RYZE Intelligence 6 questions. Some worked. Some failed completely. The system knew about the call OR the resume. Never both — until we connected them. One foreign key. That's all it took. More data. Smarter AI.",
    },
    {
        num: 10,
        title: "Adding Candidates to the Platform",
        thumb: EP10,
        url: "https://www.linkedin.com/posts/daneahern_episode-10-of-building-ryzeai-ryze-is-a-activity-7439683948621860864-TiN_?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "RYZE turns recruiting activity into proprietary intelligence. I uploaded six test resumes using three methods: copy/paste, direct document upload, and LinkedIn profile copy. RYZE parses each one into structured candidate data, generates embeddings, and lets Claude interact with the dataset conversationally. Instead of searching resumes — you're querying your own recruiting intelligence layer.",
    },
    {
        num: 9,
        title: "End-to-End Booking Test",
        thumb: EP9,
        url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-episode-9-this-episode-activity-7439627919678787584-cU-f?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "This episode is short. Just under 2 minutes. Candidate books a call → admin confirms → Zoom meeting creates → Calendar event creates → confirmation email sends → 15-minute reminder fires. The full booking loop, end-to-end, working in production.",
    },
    {
        num: 8,
        title: "Conversational AI Interface",
        thumb: EP8,
        url: "https://www.linkedin.com/posts/daneahern_episode-8-of-building-ryze-in-public-i-built-activity-7439362320063012864-TyTk?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "I built a conversational AI interface connected directly to my recruiting database. Ask it who your best candidates are for a Controller role. Ask it what you discussed with a client last week. Ask it who in your pipeline has Big 4 experience. It searches. It thinks. It answers. Your data. Your pipeline. Your intelligence.",
    },
    {
        num: 7,
        title: "RAG-Powered Intelligence Chat",
        thumb: EP7,
        url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-7-this-activity-7439103131206029312-6_DF?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "I implemented RAG-powered Intelligence Chat — ask your entire candidate database a question in plain English and get an intelligent answer back. Not keyword search. Not filters. Just a question: \"Who would be a good fit for a Controller role in Boston?\" The system searches by meaning, powered by pgvector and RAG running directly inside PostgreSQL.",
    },
    {
        num: 6,
        title: "AI Meeting Notes",
        thumb: EP6,
        url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-6-one-activity-7437906403861794816--73c?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Important conversations happen — and then the details disappear. Notes buried in email threads, scattered across documents, or never written down at all. This week I implemented AI Meeting Notes: after every Zoom call, the summary is automatically captured and saved to the database as part of the candidate or employer record.",
    },
    {
        num: 5,
        title: "End-to-End Testing",
        thumb: EP5,
        url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-5-this-activity-7437041631528267776-gSkN?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "This week was all about testing the entire booking system end-to-end. All four meeting flows are now working. The system generates an AI research brief before every call so recruiters walk in prepared. Building software is mostly testing, fixing bugs, and trying again — that's what this episode shows.",
    },
    {
        num: 4,
        title: "Building the Booking System",
        thumb: EP4,
        url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-4-booking-activity-7435763383817269248-qiZc?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Booking systems sound simple until you actually build one. This week I worked through four different meeting scenarios: Recruiter→Candidate, Recruiter→Employer, Candidate→Recruiter, and Employer→Recruiter. Each flow needs different fields, different logic, and different AI research rules. Candidates don't have company websites. Employers do. Small details create surprisingly complex systems.",
    },
    {
        num: 3,
        title: "What If Your Hiring Data Was Connected?",
        thumb: EP3,
        url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-3-what-activity-7434907747122524160-JE-O?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "Notes in spreadsheets. Candidate history in email threads. Call outcomes on sticky notes. The data exists — it's just scattered everywhere and doing nothing. I'm a CPA and Controller. I've spent years inside companies watching valuable business data get created and immediately lost. I built RYZE because I've lived this problem from both sides of the table.",
    },
    {
        num: 2,
        title: "Preparation & Reminders",
        thumb: EP2,
        url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-2-one-activity-7434615686380900352-RVmV?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "One of the biggest problems in recruiting is simple: people walk into calls unprepared. This episode covers automated 15-minute reminders before every Zoom meeting and AI pre-call briefs that summarize the company you're about to speak with. Small features like this are what slowly turn a scheduling tool into a real recruiting platform.",
    },
    {
        num: 1,
        title: "Start of Series",
        thumb: EP1,
        url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-1-start-activity-7434171807298908160-SMk2?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
        desc: "What does it actually take to build an ATS from scratch? I'm documenting the entire process as I build RYZE.ai in public. The goal: build a recruiting platform that captures the data recruiters create every day. Employer booking flow, admin dashboard, AI pre-call briefs, Zoom + Calendar integration, and OAuth login — all live on day one.",
    },
];

const PHASES = [
    {
        id: "1",
        title: "Platform Foundation",
        status: "complete",
        summary: "Built the core platform from scratch and deployed it to production. The foundation includes a full booking system for employer-initiated meetings, an admin dashboard, AI-generated pre-call research briefs, and all the integrations needed to run real recruiting calls — Zoom, Google Calendar, email, SMS, and OAuth login.",
        bullets: [
            "Employer booking flow — desktop & mobile",
            "Admin dashboard for booking management",
            "Zoom + Google Calendar integration — dynamic meeting creation",
            "Email (Resend) + SMS (Twilio) notifications",
            "OAuth login — Google & LinkedIn",
            "AI pre-call research briefs via Claude API",
            "Automated 15-minute reminders before every call",
        ],
    },
    {
        id: "2",
        title: "Full Booking System",
        status: "complete",
        summary: "Expanded from employer-only booking into all four meeting flows a recruiting firm actually needs. Each direction — recruiter outbound and candidate/employer inbound — has its own logic, fields, and AI research rules. Tested every flow end-to-end in production before building anything on top.",
        bullets: [
            "4 booking flows: Recruiter→Candidate, Recruiter→Employer, Candidate→Recruiter, Employer→Recruiter",
            "Per-flow logic — candidates and employers need different fields and AI research rules",
            "Candidate self-booking flow",
            "Recruiter outbound meeting invites",
            "End-to-end production test — Zoom creates, Calendar fires, email sends, reminder triggers",
        ],
    },
    {
        id: "3",
        title: "AI Intelligence Layer",
        status: "complete",
        summary: "Transformed RYZE from a scheduling tool into an intelligence platform. Every Zoom call now produces an AI-written meeting summary saved directly to the candidate or employer record. Then came the centerpiece: a conversational AI interface that lets recruiters query their entire database in plain English — powered by pgvector and RAG running inside PostgreSQL.",
        bullets: [
            "AI Meeting Notes — post-call summaries auto-saved via Zoom webhook",
            "PGVector installed on production Postgres 16",
            "RAG pipeline — semantic search by meaning, not keywords",
            "Conversational chat interface at /admin/chat — 8 tools, agentic loop",
            "Inline candidate and meeting cards returned with chat responses",
            "Chat session persistence — grouped sidebar, AI-generated titles",
        ],
    },
    {
        id: "4",
        title: "Candidate Data Pipeline",
        status: "complete",
        summary: "Built the full candidate intake and indexing pipeline. Recruiters can upload a PDF resume, paste a LinkedIn profile, or enter details manually — Claude parses each one into structured profile fields automatically. Every candidate is then embedded using OpenAI and indexed for semantic search, so RYZE Intelligence can find them by meaning the moment they're saved.",
        bullets: [
            "Candidate parsing — PDF upload, text paste, LinkedIn copy → structured fields via Claude",
            "Duplicate detection — name + location check before saving",
            "OpenAI text-embedding-3-small — 1536-dim embeddings on every candidate",
            "Auto-embed on save — runs in background, status badge updates in real time",
            "Semantic search endpoint — cosine similarity via raw SQL",
            "Employer and job order parsing + embedding — same pipeline",
        ],
    },
    {
        id: "5",
        title: "Intelligence UI Redesign",
        status: "complete",
        summary: "Redesigned the Intelligence feature from a card-heavy database browser into a prose-first recruiting assistant. The AI now responds like a senior recruiter — natural, confident paragraphs first, with structured candidate and employer cards available on demand behind a toggle.",
        bullets: [
            "Prose-first AI responses — senior recruiter voice, no markdown or field labels",
            "Updated system prompt — returns conversational prose + structured ID references",
            "IntelligenceMessage.jsx — new component replacing inline card rendering",
            "CandidateResultCard.jsx — compact card with career level + cert badges",
            "EmployerResultCard.jsx — compact card with relationship status badge",
            "View Candidates / View Employers toggle — lazy-fetches fresh data on demand",
            "View Profile links to CandidateModal · View Employer navigates to EmployerRoster",
        ],
    },
    {
        id: "6",
        title: "DB Explorer",
        status: "complete",
        summary: "Built the DB Explorer as a personal debugging tool — a way to inspect the production database without writing raw SQL. It proved so useful during development that it shipped as a permanent admin feature. Gives any technical user full visibility into every table, record, and relationship in the system.",
        bullets: [
            "Browse all 9 tables — bookings, candidates, employers, job orders, users, waitlist, chat sessions, chat messages, contacts",
            "Search, sort, and date range filtering per table",
            "Inline edit — patch editable fields directly from the UI",
            "Delete with confirmation — hard delete with row count update",
            "Foreign key navigation — click any ID to jump to related record",
            "Embedding badges — visual status for which records have vectors",
            "CSV export — download the current filtered view",
        ],
    },
    {
        id: "7",
        title: "Zoom Webhook & Transcript Pipeline",
        status: "complete",
        summary: "Debugged and completed the post-call data pipeline. Zoom fires three separate webhook events after a meeting ends — meeting.ended, recording.completed, and recording.transcript_completed — and they don't arrive at the same time. The webhook handler was only listening to the first two. This phase adds the missing handler, fixes the download token location in the payload, and ensures the full transcript is automatically saved to the correct candidate or employer record after every call.",
        bullets: [
            "Identified all three Zoom post-call webhook events and their timing differences",
            "Added recording.transcript_completed handler — the event that fires when the .vtt file is ready",
            "Fixed download token extraction — Zoom moved it in the payload between event types",
            "Transcript auto-saves to the candidate or employer record on every completed call",
            "1946 chars recorded to the database on first successful end-to-end test",
            "RYZE Intelligence now has access to the full conversation — not just the AI summary",
        ],
    },
    {
        id: "8",
        title: "Candidate & Employer Profile Pages",
        status: "complete",
        summary: "Replaced edit modals with full read-only profile pages built for sharing with clients. Candidate profiles include AI summary, experience, education, outreach message, skills, and recruiter notes. Employer profiles include company overview, hiring needs, talking points, red flags, and linked job orders. Both accessible directly from Intelligence chat results. Consolidated the auth flow to a single entry point at /auth with admin login access.",
        bullets: [
            "CandidateProfile page at /admin/candidates/:id — shareable, read-only",
            "EmployerProfile page at /admin/employers/:id — shareable, read-only",
            "Intelligence chat 'View Profile' now navigates to profile pages instead of edit modals",
            "Employer dashboard — company brief + linked open roles pulled from live data",
            "Candidate dashboard — open job opportunities from live job orders + scheduled calls",
            "Auth consolidated to /auth — single login entry point with admin access link",
            "Two new API endpoints: GET /api/employer-profiles/me and GET /api/job-orders/open",
        ],
    },
    {
        id: "9",
        title: "Candidate & Employer Dashboards",
        status: "complete",
        summary: "Built the Candidate and Employer dashboard views — the first dedicated experience for each user type outside of the admin panel. Candidate dashboards show profile details, upcoming scheduled calls, and open job opportunities. Employer dashboards show the company brief, linked job orders, and candidate activity. Built with static data first to lock in the layout and structure before connecting live AI matching.",
        bullets: [
            "Candidate dashboard — profile summary, upcoming calls, open job opportunities",
            "Employer dashboard — company brief, linked job orders, candidate activity",
            "Separate authenticated routes for candidate and employer user types",
            "Static data layer — structure and layout validated before live data wiring",
            "Foundation in place for AI-powered matching in the next phase",
        ],
    },
    {
        id: "10",
        title: "AI Candidate & Employer Matching",
        status: "complete",
        summary: "Wired live AI matching into both dashboards using pgvector cosine similarity. Candidates see open job opportunities ranked by fit against their embedded profile. Employers see candidate suggestions ranked by match score for every open position. The static placeholder layer was replaced with real-time intelligence pulled directly from the database.",
        bullets: [
            "pgvector cosine similarity — candidate embeddings matched against job order embeddings",
            "Candidate dashboard — open roles ranked by fit score in real time",
            "Employer dashboard — candidate suggestions ranked per open position",
            "Match scores surfaced in the UI — not just ranked, but scored",
            "Static placeholder data fully removed from both dashboards",
        ],
    },
    {
        id: "11",
        title: "Multi-Tenant Architecture",
        status: "complete",
        summary: "Stress-tested the multi-tenant isolation layer before opening RYZE to external recruiters. Every table carries a tenant_id column, every query filters by the authenticated user's tenant, and cross-tenant data access was systematically blocked and verified end-to-end. The isolation model is confirmed solid — no data leaks across tenants under any tested condition.",
        bullets: [
            "tenant_id column on every table — row-level isolation across the full schema",
            "Every query scoped to the authenticated user's tenant — no exceptions",
            "Cross-tenant access attempts blocked and verified end-to-end",
            "Admin, candidate, and employer user types each tested in isolation",
            "Concurrent session behavior verified across multiple tenant contexts",
            "Foundation confirmed solid before the invite system opens the doors",
        ],
    },
    {
        id: "12",
        title: "Invite System, Free Trial & Stripe Billing",
        status: "complete",
        summary: "EP17 opens the doors. A single admin action onboards any recruiting firm — creates their tenant, starts a 30-day free trial, and fires a branded welcome email with login credentials. Stripe converts trial users to paying subscribers. A full billing lifecycle is in place: trial badge in the header, 402 enforcement on every data endpoint, upgrade wall, Stripe Checkout, and a webhook-driven activation flow. A firm goes from zero to paying customer in under 5 minutes.",
        bullets: [
            "Admin invite endpoint — creates tenant, generates slug, sets 30-day trial in one action",
            "Branded welcome email — fires via Resend with temp password and login link",
            "Tenant model — status field: trial | active | expired | cancelled",
            "Trial badge in AdminHeader — shows days remaining, turns urgent red at 7 days",
            "402 enforcement — every data endpoint checks trial/billing state via deps.py",
            "Global 402 interceptor in AuthContext — auto-redirects to /upgrade on expiry",
            "UpgradePage — trial expired wall with Stripe Checkout redirect",
            "Stripe Checkout session endpoint — creates hosted payment page per tenant",
            "Stripe webhook handler — activates tenant on checkout.session.completed",
            "BillingSuccess page — confetti confirmation, auto-redirects to dashboard",
            "InviteForm.jsx — admin UI for onboarding new firms with success state",
        ],
    },
    {
        id: "13",
        title: "Candidate Profile & PDF Export",
        status: "complete",
        summary: "Rebuilt the candidate profile from a data-entry view into a recruiter-grade presentation layer. Every profile now has a branded banner, headshot upload via DigitalOcean Spaces, and a hero layout with name, title, and location overlaid directly on the banner. AI-generated content restructured from paragraphs into scannable bullets. One-click PDF export renders a fully branded profile via Playwright — ready to send to a hiring manager.",
        bullets: [
            "Banner image upload — stored in DigitalOcean Spaces, rendered as hero background",
            "Headshot upload — circular avatar with camera overlay, object-fit crop",
            "Hero layout — name, title, company, location, and badge row overlaid on banner",
            "Experience restructured — AI prose split into scannable bullet points",
            "Education restructured — degrees and certifications as individual bullets",
            "PDF export via Playwright — branded HTML template rendered by headless Chromium",
            "PDF mirrors the UI — same banner, headshot, skills, certs, and layout",
            "Streaming PDF response — downloads directly from the browser in one click",
        ],
    },
    {
        id: "14",
        title: "Employer Profile & Self-Profile",
        status: "complete",
        summary: "Mirrored the candidate profile pattern on the employer side. Every employer now has a branded profile page with logo upload, banner image, and a polished identity-zone layout. Employers can log in, view their own profile, edit company details, and upload images — all stored in DigitalOcean Spaces with automatic replacement on re-upload. A silent SQLAlchemy model bug was caught and fixed: the migration had added the columns to the DB but the ORM didn't know about them, so every upload succeeded in Spaces but the URL was never persisted.",
        bullets: [
            "EmployerSelfProfile.jsx — employer-facing profile page at /employer/profile",
            "Logo upload — stored in DigitalOcean Spaces, replaces previous file on re-upload",
            "Banner upload — same pattern, auto-cleanup of orphaned files",
            "PATCH /api/employer-profiles/me — self-edit for whitelisted fields",
            "POST /api/employer-profiles/me/logo and /me/banner — image upload endpoints",
            "primary_contact_email linking — profile resolved by matching user email",
            "SQLAlchemy model fix — logo_url and banner_url columns added to EmployerProfile model",
            "Re-embedding on save — background task fires after every profile edit",
        ],
    },
    {
        id: "15",
        title: "Job Orders & PDF Exports",
        status: "complete",
        summary: "Built the complete job order workflow and shipped branded PDF exports for both job orders and employer profiles. The AI parser takes raw job posting text — copy/pasted from anywhere — and auto-extracts the title, location, salary range, and requirements in one click. PDF generation runs server-side via Playwright (headless Chromium), producing branded deliverables recruiters can send to candidates immediately from the admin panel.",
        bullets: [
            "Job Orders roster — paginated table with status badges and quick actions",
            "Create form — manual entry or AI-parsed from raw job posting text",
            "AI parser — Claude extracts title, location, salary range, and requirements from pasted text",
            "Job Order detail page — full view with all structured fields",
            "Inline editing — edit any field directly from the detail page",
            "Status management — draft, active, filled, cancelled transitions",
            "PDF export for Job Orders — branded Playwright render, one-click download",
            "PDF export for Employer Profiles — same pipeline, downloadable from admin panel",
            "Playwright server-side rendering — headless Chromium generates all PDFs",
            "Streaming PDF response — browser download triggered in one click",
        ],
    },
    {
        id: "16",
        title: "Job Order UI Polish & Two-Way Navigation",
        status: "complete",
        summary: "Polished the job order detail page to match the employer profile design standard — full-width banner, logo overlapping the edge, and a clean identity zone with title and meta below it. Banner images uploaded to an employer profile now automatically propagate to all their job order pages with zero extra work. Two-way navigation wired end-to-end: clicking an open role on the Employer Profile navigates directly to the job order, and the job order links back. The PDF got the same treatment — banner height increased, identity zone card removed, Recruiter Notes accent corrected from mustard yellow to navy.",
        bullets: [
            "Job order detail page — full employer profile treatment (banner, logo, identity zone)",
            "Banner propagation — employer banner upload auto-surfaces on all linked job orders",
            "Two-way navigation — Employer Profile → Job Order → Employer Profile",
            "PDF polish — banner height increased, identity zone card removed",
            "PDF accent color — Recruiter Notes updated from mustard yellow to navy",
            "PDF mirrors the UI — consistent visual language across web and export",
            "PostCSS brace bug squashed — prevented CSS Modules from compiling correctly",
        ],
    },

];

const DEMO_QUERIES = [
    {
        q: "Do I have any meetings this morning?",
        a: "2 confirmed calls today. 9:00 AM — Sarah Chen, Controller candidate. 11:30 AM — Marcus Rivera, CFO",
    },
    {
        q: "Recommend a CPA for the Controller role at Acme.",
        a: "1. Jennifer Walsh, CPA — 94% match. Big 4, NetSuite certified.",
    },
    {
        q: "What do we know about Deloitte candidates?",
        a: "4 Deloitte alumni in your pipeline. Avg target: $130–160K. Top reason for leaving: better work-life balance.",
    },
];

const INTENT_OPTIONS = [
    { value: "hiring", icon: Building2, label: "I'm hiring" },
    { value: "job_seeking", icon: BriefcaseBusiness, label: "I'm job hunting" },
    { value: "following", icon: Binoculars, label: "Following the build" },
];

function RyzeLogo({ size = 32, color = "#004aad" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 375 322"
            width={size}
            height={Math.round(size * (322 / 375))}
            aria-hidden="true"
            style={{ display: "block", flexShrink: 0 }}
        >
            <path
                fill={color}
                d="M 186.078125 19.484375 L 0.367188 341.148438 L 180.234375 341.148438 L 229.054688 256.585938 L 201.605469 215.015625 L 190.46875 234.308594 L 154.511719 296.59375 L 77.539062 296.59375 L 186.394531 108.039062 L 296.730469 295.972656 L 243.730469 295.972656 L 221.453125 340.527344 L 374.554688 340.527344 Z"
            />
        </svg>
    );
}

function DemoChat() {
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState("typing");
    const [displayQ, setDisplayQ] = useState("");
    const [displayA, setDisplayA] = useState("");

    useEffect(() => {
        const entry = DEMO_QUERIES[idx];
        setDisplayQ("");
        setDisplayA("");
        setPhase("typing");

        let qi = 0;
        const typingTimer = setInterval(() => {
            qi++;
            setDisplayQ(entry.q.slice(0, qi));
            if (qi >= entry.q.length) {
                clearInterval(typingTimer);
                setTimeout(() => {
                    setPhase("answering");
                    let ai = 0;
                    const ansTimer = setInterval(() => {
                        ai += 3;
                        setDisplayA(entry.a.slice(0, ai));
                        if (ai >= entry.a.length) {
                            setDisplayA(entry.a);
                            clearInterval(ansTimer);
                            setPhase("done");
                            setTimeout(() => {
                                setPhase("fading");
                                setTimeout(() => setIdx(i => (i + 1) % DEMO_QUERIES.length), 500);
                            }, 3500);
                        }
                    }, 16);
                }, 500);
            }
        }, 35);
        return () => clearInterval(typingTimer);
    }, [idx]);

    return (
        <div className={`${styles.demo} ${phase === "fading" ? styles.demoFading : ""}`}>
            <div className={styles.demoTitleBar}>
                <div className={styles.demoTrafficLights}>
                    <span style={{ background: "#ff5f57" }} />
                    <span style={{ background: "#febc2e" }} />
                    <span style={{ background: "#28c840" }} />
                </div>
                <span className={styles.demoWindowTitle}>RYZE Intelligence</span>
            </div>
            <div className={styles.demoMessages}>
                {displayQ && (
                    <div className={styles.demoMsgUser}>
                        <div className={styles.demoMsgLabel}>You</div>
                        <div className={styles.demoMsgBubble}>
                            {displayQ}
                            {phase === "typing" && <span className={styles.cursor}>|</span>}
                        </div>
                    </div>
                )}
                {phase === "answering" && !displayA && (
                    <div className={styles.demoMsgAi}>
                        <div className={styles.demoMsgLabel}><RyzeLogo size={12} color="#fff" /> RYZE</div>
                        <div className={styles.demoThinking}><span /><span /><span /></div>
                    </div>
                )}
                {displayA && (
                    <div className={styles.demoMsgAi}>
                        <div className={styles.demoMsgLabel}><RyzeLogo size={12} color="#fff" /> RYZE</div>
                        <div className={styles.demoMsgAiBubble}>
                            {displayA}
                            {phase === "answering" && <span className={styles.cursor}>|</span>}
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.demoPips}>
                {DEMO_QUERIES.map((_, i) => (
                    <span key={i} className={`${styles.pip} ${i === idx ? styles.pipActive : ""}`} />
                ))}
            </div>
        </div>
    );
}

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const waitlistRef = useRef(null);

    const [email, setEmail] = useState("");
    const [intent, setIntent] = useState(null);
    const [wlStatus, setWlStatus] = useState("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [openPhase, setOpenPhase] = useState(null);
    const [showAllEpisodes, setShowAllEpisodes] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.user_type === "ADMIN") navigate("/admin");
            else if (user.user_type === "EMPLOYER") navigate("/employer/dashboard");
            else navigate("/candidate/dashboard");
        }
    }, [user, navigate]);

    async function handleWaitlist() {
        setErrorMsg("");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setErrorMsg("Please enter a valid email address.");
            return;
        }
        setWlStatus("loading");
        try {
            const res = await fetch(`${API_BASE}/api/waitlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), intent: intent || "following", source: "ryze_ai_landing" }),
            });
            if (res.ok || res.status === 409) {
                setWlStatus("success");
            } else {
                const d = await res.json().catch(() => ({}));
                setErrorMsg(d.detail || "Something went wrong. Please try again.");
                setWlStatus("idle");
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
            setWlStatus("idle");
        }
    }

    return (
        <div className={styles.page}>

            {/* ── Header ─────────────────────────────────── */}
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <a href="/" className={styles.brand}>
                        <span className={styles.brandName}>RYZE.ai</span>
                        <span className={styles.brandPipe}>|</span>
                        <span className={styles.brandSub}>AI Intelligence Platform</span>
                    </a>

                    <div className={styles.headerRight}>
                        <a href="/" className={styles.homeBtn}>
                            ← Home
                        </a>

                        <a
                            href="https://www.linkedin.com/in/daneahern/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkedinBtn}
                        >
                            Follow on LinkedIn
                        </a>
                    </div>
                </div>
            </header>

            {/* ── Hero ───────────────────────────────────── */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.docTag}>
                        <span className={styles.livePulse} />
                        Version {CURRENT_VERSION} &nbsp;·&nbsp; May 2026 &nbsp;·&nbsp; Building in Public
                    </div>

                    <h1 className={styles.heroTitle}>
                        I'm buillt an AI-powered recruiting platform from scratch —
                        <em> and documented every step.</em>
                    </h1>

                    <p className={styles.heroSub}>
                        RYZE.ai is a recruiting platform I'm building and documenting in real time. Every feature ships as a video—follow along as a simple scheduling tool grows into a full AI intelligence layer for modern recruiting.
                    </p>
                    <div className={styles.heroCtas}>
                        <button
                            className={styles.ctaPrimary}
                            onClick={() => waitlistRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
                        >
                            Join the Waitlist
                        </button>
                        <a
                            href="https://www.linkedin.com/in/daneahern/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.ctaSecondary}
                        >
                            Watch the build on LinkedIn →
                        </a>
                    </div>
                </div>

                <div className={styles.heroDemo}>
                    <DemoChat />
                </div>
            </section>

            {/* ── Building in Public / Episodes ────────── */}
            <section className={styles.episodesSection}>
                <div className={styles.container}>
                    <div className={styles.eyebrow}>Building in Public</div>
                    <h2 className={styles.sectionH2}>{EPISODES.length} episodes. Still building.</h2>
                    <p className={styles.sectionP}>
                        Every major milestone gets a video — published on <strong>LinkedIn</strong>. Hover any episode to see what was built.
                    </p>

                    <div className={styles.episodeGrid}>
                        {EPISODES
                            .slice(0, showAllEpisodes ? EPISODES.length : 3)
                            .map((ep) => {
                                if (ep.comingSoon) {
                                    const CardEl = ep.url ? "a" : "div";
                                    const cardProps = ep.url
                                        ? { href: ep.url, target: "_blank", rel: "noopener noreferrer" }
                                        : {};
                                    return (
                                        <CardEl
                                            key={ep.num}
                                            className={`${styles.episodeCard} ${styles.episodeCardComingSoon}`}
                                            {...cardProps}
                                        >
                                            <div className={styles.epDefault}>
                                                <div className={styles.epTop}>
                                                    <span className={styles.epNum}>Ep {ep.num}</span>
                                                    <span className={styles.epComingBadge}>Coming Soon</span>
                                                </div>
                                                <div className={styles.epTitle}>{ep.title}</div>
                                            </div>
                                            <div className={styles.epHover}>
                                                <div className={styles.epHoverNum}>Episode {ep.num} — Coming Soon</div>
                                                <p className={styles.epHoverDesc} style={{ whiteSpace: "pre-line" }}>
                                                    {ep.desc}
                                                </p>
                                                {ep.url && <span className={styles.epHoverLink}>Read on LinkedIn →</span>}
                                            </div>
                                        </CardEl>
                                    );
                                }
                                return (
                                    <a
                                        key={ep.num}
                                        href={ep.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.episodeCard}
                                    >
                                        <div className={styles.epThumbWrap}>
                                            <img src={ep.thumb} alt={`Episode ${ep.num}`} className={styles.epThumb} />
                                        </div>
                                        <div className={styles.epHover}>
                                            <div className={styles.epHoverNum}>Episode {ep.num}</div>
                                            <p className={styles.epHoverDesc}>{ep.desc}</p>
                                            <span className={styles.epHoverLink}>Watch on LinkedIn →</span>
                                        </div>
                                    </a>
                                );
                            })}
                    </div>

                    <button
                        className={styles.showMoreBtn}
                        onClick={() => setShowAllEpisodes((prev) => !prev)}
                    >
                        {showAllEpisodes ? "Show less ↑" : `Show all ${EPISODES.length} episodes ↓`}
                    </button>
                </div>
            </section>

            {/* ── Phases / The Build So Far ─────────────── */}
            <section className={styles.phasesSection}>
                <div className={styles.container}>
                    <div className={styles.eyebrow}>The Build So Far</div>
                    <h2 className={styles.sectionH2}>Where I am in the build.</h2>

                    <div className={styles.phases}>
                        {PHASES.map((p) => {
                            const isOpen = openPhase === p.id;
                            return (
                                <div key={p.id} className={`${styles.phaseItem} ${styles[`pStatus_${p.status}`]}`}>
                                    <button className={styles.phaseToggle} onClick={() => setOpenPhase(isOpen ? null : p.id)}>
                                        <div className={styles.phaseToggleLeft}>
                                            <span className={styles.phaseIdLabel}>Phase {p.id}</span>
                                            <span className={`${styles.phasePill} ${styles[`pill_${p.status}`]}`}>
                                                {p.status === "complete" ? "✓ Complete"
                                                    : p.status === "next" ? "⬡ Up Next"
                                                        : p.status === "planned" ? "Planned"
                                                            : "Future"}
                                            </span>
                                        </div>
                                        <span className={styles.phaseToggleTitle}>{p.title}</span>
                                        <span className={styles.phaseChevron}>{isOpen ? "−" : "+"}</span>
                                    </button>
                                    {isOpen && (
                                        <div className={styles.phaseDetail}>
                                            <p>{p.summary}</p>
                                            <ul>
                                                {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── What's Next ──────────────────────────── */}
            <section className={styles.whatsNextSection}>
                <div className={styles.container}>
                    <div className={styles.eyebrow}>What's Next</div>
                    <h2 className={styles.sectionH2}>Still building. Here's what's coming.</h2>


                    <div className={styles.nextGrid}>

                        <div className={styles.nextCard}>
                            <div className={styles.nextNum}>EP 23</div>
                            <div className={styles.nextTitle}>Media Queries &amp; Mobile Responsiveness</div>
                            <p className={styles.nextDesc}>
                                Full mobile responsiveness sweep — Employer Profile, Job Order Detail,
                                Job Order Roster, Employer Roster, and RYZE Intelligence. iPhone Mirroring
                                made the workflow fast: real device rendering live next to the code, no
                                picking up the phone. Media queries until every page looked right on both screens.
                            </p>
                            <span className={styles.nextBadgePosted}>✓ Complete</span>
                        </div>

                        <div className={styles.nextCard}>
                            <div className={styles.nextNum}>EP 24</div>
                            <div className={styles.nextTitle}>MVP / Business Launch — Series Complete</div>
                            <p className={styles.nextDesc}>
                                The final episode. Three months of 2:00 AM builds, 24 episodes, and one
                                working recruiting platform. The series is done — the business starts now.
                                Launching a recruiting practice for accounting and finance professionals,
                                using RYZE.ai as the tool.
                            </p>
                            <span className={styles.nextBadgePosted}>✓ Complete</span>
                        </div>

                        <div className={styles.nextCard}>
                            <div className={styles.nextNum}>What's Next</div>
                            <div className={styles.nextTitle}>Launching the Recruiting Business</div>
                            <p className={styles.nextDesc}>
                                The build-in-public series is complete. Now comes the real test — using
                                RYZE.ai to run an actual recruiting business. Follow along on LinkedIn
                                as the platform gets its first real-world workout.
                            </p>
                            <span className={styles.nextBadge}>In progress</span>
                        </div>

                    </div>

                </div>
            </section>

            {/* ── Waitlist ─────────────────────────────── */}
            <section className={styles.waitlistSection} ref={waitlistRef}>
                <div className={styles.waitlistInner}>
                    <h2 className={styles.waitlistTitle}>Stay in the loop.</h2>
                    <p className={styles.waitlistSub}>
                        Get notified when RYZE opens to recruiters — and follow along as each new feature ships.
                    </p>

                    {wlStatus === "success" ? (
                        <>
                            <div className={styles.successState}>
                                <div className={styles.successCheck}>✓</div>
                                <div>
                                    <p className={styles.successTitle}>You're on the list.</p>
                                    <p className={styles.successSub}>We'll reach out when RYZE is ready for you.</p>
                                </div>
                            </div>
                            <p className={styles.trustLine}>No spam. Unsubscribe any time.</p>
                        </>
                    ) : (
                        <div className={styles.wlForm}>
                            <div className={styles.intentRow}>
                                {INTENT_OPTIONS.map(({ value, icon: Icon, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`${styles.intentBtn} ${intent === value ? styles.intentBtnOn : ""}`}
                                        onClick={() => setIntent(v => v === value ? null : value)}
                                        disabled={wlStatus === "loading"}
                                    >
                                        <Icon size={18} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className={styles.emailRow}>
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setErrorMsg(""); }}
                                    className={`${styles.emailInput} ${errorMsg ? styles.emailInputErr : ""}`}
                                    disabled={wlStatus === "loading"}
                                    onKeyDown={e => e.key === "Enter" && handleWaitlist()}
                                />
                                <button
                                    className={styles.notifyBtn}
                                    onClick={handleWaitlist}
                                    disabled={wlStatus === "loading"}
                                >
                                    {wlStatus === "loading" ? <span className={styles.spinner} /> : "Notify Me"}
                                </button>
                            </div>

                            {errorMsg && <p className={styles.errMsg}>{errorMsg}</p>}
                            <p className={styles.trustLine}>No spam. Unsubscribe any time.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Footer ───────────────────────────────── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <RyzeLogo size={16} color="#57a0d3" />
                        <span>RYZE.ai</span>
                    </div>
                    <div className={styles.footerLinks}>
                        <a href="/privacy">Privacy</a>
                        <a href="/terms">Terms</a>
                        <a href="https://www.linkedin.com/in/daneahern/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                    <p className={styles.footerCopy}>© 2026 RYZE GROUP, Inc. d/b/a RYZE.ai · Version {CURRENT_VERSION}</p>
                </div>
                <a href="/admin/login" className={styles.adminGhost}>Admin</a>
            </footer>
        </div>
    );
}
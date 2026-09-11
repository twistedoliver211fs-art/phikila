import type { DocPage } from "./docs-data";

const docsContent: Record<string, DocPage> = {
  // ─────────────────────────────────────────────
  // GETTING STARTED
  // ─────────────────────────────────────────────
  "getting-started/overview": {
    title: "Overview",
    description: "Introduction to Decimal — the modern school management platform",
    section: "GET STARTED",
    headings: [
      { id: "what-is-decimal", title: "What is Decimal?", level: 2 },
      { id: "who-is-it-for", title: "Who is it for?", level: 2 },
      { id: "key-capabilities", title: "Key capabilities", level: 2 },
      { id: "architecture", title: "Architecture", level: 2 },
      { id: "getting-help", title: "Getting help", level: 2 },
    ],
    content: `
      <h2 id="what-is-decimal">What is Decimal?</h2>
      <p>Decimal is a comprehensive, cloud-based school management platform designed to digitize and streamline every aspect of school administration. Built with modern web technologies, it provides a single pane of glass for managing students, staff, academics, finances, and communications across one or multiple school campuses.</p>
      <p>Unlike legacy school management systems that require expensive on-premise infrastructure, Decimal runs entirely in the browser and synchronizes data in real time. It works offline, supports Android and desktop applications, and is designed to be intuitive enough for first-time computer users.</p>
      <blockquote>
        <p>Decimal is built by educators, for educators. Every feature is designed to reduce administrative burden and give teachers more time to focus on what matters most — teaching.</p>
      </blockquote>

      <h2 id="who-is-it-for">Who is it for?</h2>
      <p>Decimal is designed for the entire school ecosystem:</p>
      <ul>
        <li><strong>School administrators and principals</strong> — Get a bird's-eye view of school performance, enrollment trends, and staff activity. Make data-driven decisions with real-time analytics.</li>
        <li><strong>Teachers</strong> — Manage your classes, take attendance in seconds, record grades, and communicate with parents — all from your phone or laptop.</li>
        <li><strong>Finance officers</strong> — Create fee structures, track payments, generate receipts, and produce financial reports without spreadsheets.</li>
        <li><strong>Admissions staff</strong> — Process applications, manage enrollment pipelines, and onboard new students with structured workflows.</li>
        <li><strong>Parents</strong> — Stay informed about your child's attendance, grades, fees, and school announcements through a dedicated parent portal.</li>
        <li><strong>Super administrators</strong> — Manage multiple schools from a single platform with cross-school analytics and centralized configuration.</li>
      </ul>

      <h2 id="key-capabilities">Key capabilities</h2>
      <table>
        <thead>
          <tr><th>Capability</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>Student management</td><td>Complete student profiles, enrollment tracking, guardians, medical info, and documents</td></tr>
          <tr><td>Attendance</td><td>Daily roll call with absent/present/late/excused statuses and parent notifications</td></tr>
          <tr><td>Academics</td><td>Subjects, classes, grading systems, report cards, and academic year management</td></tr>
          <tr><td>Examinations</td><td>Exam scheduling, mark entry, grade computation, and result publication</td></tr>
          <tr><td>Timetable</td><td>Visual timetable builder with conflict detection and teacher/class scheduling</td></tr>
          <tr><td>Finance</td><td>Fee structures, invoicing, payment tracking, receipts, and financial reports</td></tr>
          <tr><td>Communication</td><td>In-app messaging, announcements, and parent-teacher communication</td></tr>
          <tr><td>Reports</td><td>Analytics dashboards, report cards, attendance summaries, and exportable data</td></tr>
        </tbody>
      </table>

      <h2 id="architecture">Architecture</h2>
      <p>Decimal uses a modern, performant technology stack:</p>
      <ul>
        <li><strong>Frontend:</strong> Next.js 16 App Router with React 19 and Tailwind CSS</li>
        <li><strong>Backend:</strong> Supabase (PostgreSQL with Row-Level Security)</li>
        <li><strong>Auth:</strong> Supabase Auth with Google OAuth and Turnstile captcha</li>
        <li><strong>Offline:</strong> IndexedDB with background sync engine</li>
        <li><strong>Mobile:</strong> Capacitor (Android) and Tauri (Desktop)</li>
        <li><strong>Hosting:</strong> Vercel with global CDN</li>
      </ul>
      <p>The platform implements an offline-first architecture. Data is stored locally in IndexedDB when the network is unavailable and automatically synchronizes when connectivity is restored. This ensures schools in areas with unreliable internet can continue operating without interruption.</p>

      <h2 id="getting-help">Getting help</h2>
      <p>If you need assistance getting started:</p>
      <ol>
        <li>Browse the <strong>Quickstart guide</strong> to set up your school in under 5 minutes</li>
        <li>Check the <strong>FAQ</strong> for answers to common questions</li>
        <li>Visit <strong>Support</strong> to contact the Decimal team directly</li>
      </ol>
    `,
  },
  "getting-started/quickstart": {
    title: "Quickstart",
    description: "Set up your school management system in 5 minutes",
    section: "GET STARTED",
    headings: [
      { id: "prerequisites", title: "Prerequisites", level: 2 },
      { id: "step-1-sign-up", title: "Step 1: Sign up", level: 2 },
      { id: "step-2-create-school", title: "Step 2: Create your school", level: 2 },
      { id: "step-3-add-staff", title: "Step 3: Add staff members", level: 2 },
      { id: "step-4-setup-academic", title: "Step 4: Set up academics", level: 2 },
      { id: "step-5-enroll-students", title: "Step 5: Enroll students", level: 2 },
      { id: "next-steps", title: "Next steps", level: 2 },
    ],
    content: `
      <h2 id="prerequisites">Prerequisites</h2>
      <ul>
        <li>A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
        <li>A valid email address for your admin account</li>
        <li>Your school's basic information (name, address, contact details)</li>
      </ul>
      <p>You do not need to install any software. Decimal runs entirely in your browser.</p>

      <h2 id="step-1-sign-up">Step 1: Sign up</h2>
      <ol>
        <li>Navigate to <code>decimal-app.vercel.app</code></li>
        <li>Click <strong>"Get Started"</strong> or <strong>"Sign Up"</strong></li>
        <li>Enter your email address and create a password</li>
        <li>Alternatively, click <strong>"Continue with Google"</strong> to use your Google account</li>
        <li>Verify your email address by clicking the link sent to your inbox</li>
      </ol>
      <blockquote>
        <p><strong>Tip:</strong> The first account created automatically receives the <code>super_admin</code> role, which has full platform access.</p>
      </blockquote>

      <h2 id="step-2-create-school">Step 2: Create your school</h2>
      <p>After signing up, you will be guided through the school creation wizard:</p>
      <ol>
        <li><strong>School name:</strong> Enter the official name of your school</li>
        <li><strong>School code:</strong> A unique identifier (e.g., <code>SCH-001</code>)</li>
        <li><strong>Contact information:</strong> Phone number, email, and physical address</li>
        <li><strong>School type:</strong> Primary, Secondary, Combined, or Tertiary</li>
        <li><strong>Logo:</strong> Upload your school logo (optional, can be added later)</li>
      </ol>
      <p>Once submitted, your school profile is created and you are redirected to the school dashboard.</p>

      <h2 id="step-3-add-staff">Step 3: Add staff members</h2>
      <p>Navigate to <strong>Staff → Add Staff</strong> and enter the following for each staff member:</p>
      <ul>
        <li>Full name</li>
        <li>Role (Principal, Teacher, Finance Officer, Secretary, Admissions Officer)</li>
        <li>Contact information</li>
        <li>Subjects they teach (for teachers)</li>
      </ul>
      <p>Each staff member will receive an invitation email with instructions to set up their account.</p>

      <h2 id="step-4-setup-academic">Step 4: Set up academics</h2>
      <p>Before enrolling students, configure your academic structure:</p>
      <ol>
        <li><strong>Academic year:</strong> Create the current academic year with start and end dates</li>
        <li><strong>Terms:</strong> Define your terms (e.g., Term 1, Term 2, Term 3) with date ranges</li>
        <li><strong>Classes:</strong> Create classes (e.g., Grade 1A, Grade 1B, Form 2A)</li>
        <li><strong>Subjects:</strong> Add subjects and assign them to classes</li>
        <li><strong>Grading system:</strong> Configure your grading scale (A–F, percentage-based, etc.)</li>
      </ol>

      <h2 id="step-5-enroll-students">Step 5: Enroll students</h2>
      <p>You can add students individually or in bulk:</p>
      <ul>
        <li><strong>Individual:</strong> Go to <strong>Students → Add Student</strong> and fill in the form</li>
        <li><strong>Bulk import:</strong> Prepare a CSV file and use <strong>Students → Import</strong> to upload</li>
      </ul>
      <p>Each student record includes personal details, guardian information, medical notes, and class assignment.</p>

      <h2 id="next-steps">Next steps</h2>
      <p>Once your school is set up, explore these features:</p>
      <ul>
        <li>Take your first <strong>attendance</strong> roll call</li>
        <li>Create a <strong>timetable</strong> for your classes</li>
        <li>Set up <strong>fee structures</strong> and generate invoices</li>
        <li>Send your first <strong>announcement</strong> to parents</li>
      </ul>
    `,
  },

  "getting-started/create-school": {
    title: "Create your school",
    description: "Register and configure your school in Decimal",
    section: "GET STARTED",
    headings: [
      { id: "school-registration", title: "School registration", level: 2 },
      { id: "required-information", title: "Required information", level: 2 },
      { id: "school-logo", title: "School logo and branding", level: 2 },
      { id: "multi-campus", title: "Multi-campus setup", level: 2 },
      { id: "after-creation", title: "After creation", level: 2 },
    ],
    content: `
      <h2 id="school-registration">School registration</h2>
      <p>Creating a school profile is the first step after signing up for Decimal. The school profile serves as the container for all your data — students, staff, classes, and finances are all scoped to a specific school.</p>

      <h2 id="required-information">Required information</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Description</th><th>Required</th></tr>
        </thead>
        <tbody>
          <tr><td>School name</td><td>The official name of your school</td><td>Yes</td></tr>
          <tr><td>School code</td><td>A unique identifier (auto-generated or custom)</td><td>Yes</td></tr>
          <tr><td>School type</td><td>Primary, Secondary, Combined, or Tertiary</td><td>Yes</td></tr>
          <tr><td>Email</td><td>School contact email</td><td>Yes</td></tr>
          <tr><td>Phone</td><td>School contact phone number</td><td>Yes</td></tr>
          <tr><td>Address</td><td>Physical address of the school</td><td>Yes</td></tr>
        </tbody>
      </table>

      <h2 id="school-logo">School logo and branding</h2>
      <p>You can upload a school logo that appears on report cards, receipts, and other generated documents. Supported formats include PNG, JPG, and SVG. The recommended size is 512x512 pixels.</p>

      <h2 id="multi-campus">Multi-campus setup</h2>
      <p>If your organization operates multiple campuses, each campus should be registered as a separate school in Decimal. The super admin can switch between schools from the top navigation bar.</p>

      <h2 id="after-creation">After creation</h2>
      <p>Once your school is created, you will be redirected to the school dashboard. From here, you can add staff members, configure academic years, create classes, and set up fee structures.</p>
    `,
  },

  "getting-started/setup-account": {
    title: "Set up your account",
    description: "Configure your admin account preferences",
    section: "GET STARTED",
    headings: [
      { id: "profile-settings", title: "Profile settings", level: 2 },
      { id: "notification-preferences", title: "Notification preferences", level: 2 },
      { id: "security", title: "Security settings", level: 2 },
      { id: "appearance", title: "Appearance", level: 2 },
    ],
    content: `
      <h2 id="profile-settings">Profile settings</h2>
      <p>After creating your account, it is important to complete your profile. Navigate to <strong>Settings → Profile</strong> to update your personal information.</p>
      <ul>
        <li><strong>Display name:</strong> Your full name as it appears across the platform</li>
        <li><strong>Avatar:</strong> Upload a profile photo for easy identification</li>
        <li><strong>Phone number:</strong> Used for SMS notifications if enabled</li>
        <li><strong>Language:</strong> Select your preferred language for the interface</li>
        <li><strong>Timezone:</strong> Set your local timezone for accurate timestamps on records</li>
      </ul>

      <h2 id="notification-preferences">Notification preferences</h2>
      <p>Decimal allows you to customize which notifications you receive and how they are delivered:</p>
      <table>
        <thead>
          <tr><th>Notification type</th><th>Channels</th><th>Default</th></tr>
        </thead>
        <tbody>
          <tr><td>New student enrollment</td><td>In-app, Email</td><td>On</td></tr>
          <tr><td>Staff invitation accepted</td><td>In-app</td><td>On</td></tr>
          <tr><td>Payment received</td><td>In-app, Email</td><td>On</td></tr>
          <tr><td>Attendance alert</td><td>In-app</td><td>On</td></tr>
          <tr><td>System updates</td><td>Email</td><td>On</td></tr>
        </tbody>
      </table>

      <h2 id="security">Security settings</h2>
      <ul>
        <li><strong>Change password:</strong> Update your password regularly. Use a strong, unique password with at least 12 characters</li>
        <li><strong>Two-factor authentication:</strong> Enable 2FA for an additional layer of security</li>
        <li><strong>Active sessions:</strong> View and revoke active sessions on other devices</li>
        <li><strong>Login notifications:</strong> Receive an email alert when your account is accessed from a new device</li>
      </ul>

      <h2 id="appearance">Appearance</h2>
      <ul>
        <li><strong>Theme:</strong> Choose between Light, Dark, or System (follows your OS preference)</li>
        <li><strong>Sidebar:</strong> Collapse or expand the sidebar navigation</li>
        <li><strong>Compact mode:</strong> Reduce spacing for denser information display</li>
      </ul>
    `,
  },

  "getting-started/invite-staff": {
    title: "Invite staff",
    description: "Add teachers and administrators to your school",
    section: "GET STARTED",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "roles-overview", title: "Available roles", level: 2 },
      { id: "invite-process", title: "Invite process", level: 2 },
      { id: "bulk-invite", title: "Bulk invitation", level: 2 },
      { id: "managing-invitations", title: "Managing invitations", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal supports a role-based access model. Each staff member is assigned a role that determines what they can see and do in the platform.</p>

      <h2 id="roles-overview">Available roles</h2>
      <table>
        <thead>
          <tr><th>Role</th><th>Description</th><th>Key permissions</th></tr>
        </thead>
        <tbody>
          <tr><td>Principal</td><td>School-wide administrator</td><td>Full access to all school data, reports, and settings</td></tr>
          <tr><td>Teacher</td><td>Classroom instructor</td><td>Manage assigned classes, take attendance, enter grades</td></tr>
          <tr><td>Finance Officer</td><td>Financial administrator</td><td>Manage fees, payments, invoices, and financial reports</td></tr>
          <tr><td>Secretary</td><td>Administrative support</td><td>Manage student records, handle communications, daily operations</td></tr>
          <tr><td>Admissions Officer</td><td>Enrollment manager</td><td>Process applications, manage enrollment pipeline</td></tr>
        </tbody>
      </table>

      <h2 id="invite-process">Invite process</h2>
      <ol>
        <li>Navigate to <strong>Staff → Add Staff</strong></li>
        <li>Enter the staff member's full name and email address</li>
        <li>Select their role from the dropdown</li>
        <li>For teachers, assign the subjects they will teach</li>
        <li>Click <strong>"Send Invitation"</strong></li>
      </ol>
      <p>The staff member will receive an email with a link to set up their account. The invitation expires after 7 days.</p>

      <h2 id="bulk-invite">Bulk invitation</h2>
      <p>To invite multiple staff members at once, go to <strong>Staff → Bulk Import</strong>, download the CSV template, fill in the details, and upload the completed file.</p>

      <h2 id="managing-invitations">Managing invitations</h2>
      <p>View all pending invitations from <strong>Staff → Pending Invitations</strong>. From here you can resend, revoke, or edit invitations.</p>
    `,
  },

  "getting-started/first-day": {
    title: "First-day checklist",
    description: "Everything to do on your first day with Decimal",
    section: "GET STARTED",
    headings: [
      { id: "checklist", title: "Setup checklist", level: 2 },
      { id: "morning-tasks", title: "Morning tasks", level: 2 },
      { id: "afternoon-tasks", title: "Afternoon tasks", level: 2 },
      { id: "end-of-day", title: "End of day", level: 2 },
    ],
    content: `
      <h2 id="checklist">Setup checklist</h2>
      <table>
        <thead>
          <tr><th>Task</th><th>Responsible</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr><td>Create school profile</td><td>Super Admin</td><td>Done</td></tr>
          <tr><td>Add all staff members</td><td>Super Admin</td><td>Done</td></tr>
          <tr><td>Create academic year and terms</td><td>Principal</td><td>Pending</td></tr>
          <tr><td>Set up classes and subjects</td><td>Principal / Secretary</td><td>Pending</td></tr>
          <tr><td>Configure grading system</td><td>Principal</td><td>Pending</td></tr>
          <tr><td>Enroll students</td><td>Secretary / Admissions</td><td>Pending</td></tr>
          <tr><td>Set up fee structures</td><td>Finance Officer</td><td>Pending</td></tr>
          <tr><td>Create timetable</td><td>Principal / Secretary</td><td>Pending</td></tr>
        </tbody>
      </table>

      <h2 id="morning-tasks">Morning tasks</h2>
      <ul>
        <li>Check <strong>Staff → Pending Invitations</strong> for any unaccepted invitations</li>
        <li>Resend invitations if needed</li>
        <li>Verify that the principal and finance officer have successfully logged in</li>
        <li>Confirm that all classes and subjects have been created</li>
      </ul>

      <h2 id="afternoon-tasks">Afternoon tasks</h2>
      <ul>
        <li>Import student records using the CSV import tool</li>
        <li>Assign students to their respective classes</li>
        <li>Upload student photos if available</li>
        <li>Verify guardian contact information for communication features</li>
        <li>Create the fee structure for the current academic year</li>
      </ul>

      <h2 id="end-of-day">End of day</h2>
      <ul>
        <li>Take a test attendance roll call to verify the process works</li>
        <li>Send a test announcement to verify communication features</li>
        <li>Review the dashboard to ensure all data is displaying correctly</li>
        <li>Document any issues or questions for the Decimal support team</li>
      </ul>
      <blockquote>
        <p><strong>Tip:</strong> Decimal works offline. If your internet connection is unreliable, continue working — data will sync automatically when connectivity is restored.</p>
      </blockquote>
    `,
  },
  // ─────────────────────────────────────────────
  // CORE FEATURES
  // ─────────────────────────────────────────────
  "core/students": {
    title: "Students",
    description: "Manage student records, enrollment, and profiles",
    section: "CORE FEATURES",
    headings: [
      { id: "student-records", title: "Student records", level: 2 },
      { id: "adding-students", title: "Adding students", level: 2 },
      { id: "student-profile", title: "Student profile", level: 2 },
      { id: "guardian-information", title: "Guardian information", level: 2 },
      { id: "search-and-filter", title: "Search and filter", level: 2 },
      { id: "bulk-operations", title: "Bulk operations", level: 2 },
    ],
    content: `
      <h2 id="student-records">Student records</h2>
      <p>The Students module is the central repository for all student information in your school. Each student has a comprehensive profile that includes personal details, academic history, guardian contacts, medical information, and documents.</p>
      <p>Student records are organized by academic year and class assignment. When a new academic year begins, students can be promoted to the next class or retained in their current class.</p>

      <h2 id="adding-students">Adding students</h2>
      <p>There are three ways to add students to Decimal:</p>
      <ol>
        <li><strong>Individual entry:</strong> Navigate to <strong>Students → Add Student</strong> and fill in the form manually</li>
        <li><strong>CSV import:</strong> Prepare a spreadsheet with student data and upload via <strong>Students → Import</strong></li>
        <li><strong>Admissions pipeline:</strong> Process applications through the <strong>Admissions</strong> module — approved applicants are automatically added as students</li>
      </ol>
      <p>When adding a student individually, the following fields are required: first name, last name, date of birth, gender, class assignment, and guardian name and contact.</p>

      <h2 id="student-profile">Student profile</h2>
      <p>Each student profile contains the following sections:</p>
      <ul>
        <li><strong>Personal info:</strong> Name, date of birth, gender, nationality, blood group, address</li>
        <li><strong>Academic:</strong> Current class, enrollment date, student ID, academic history</li>
        <li><strong>Guardian:</strong> Parent/guardian names, phone numbers, emails, and relationships</li>
        <li><strong>Medical:</strong> Allergies, conditions, medications, emergency contacts</li>
        <li><strong>Documents:</strong> Birth certificate, transfer letter, photos, and other uploaded files</li>
        <li><strong>Finance:</strong> Fee status, payment history, outstanding balances</li>
        <li><strong>Attendance:</strong> Attendance summary and history</li>
      </ul>

      <h2 id="guardian-information">Guardian information</h2>
      <p>Every student must have at least one guardian or parent linked to their profile. Guardian information includes full name, relationship to the student, phone number, email, occupation, and home address.</p>
      <p>Guardians with email addresses can be invited to the parent portal, where they can view their child's attendance, grades, and fee status.</p>

      <h2 id="search-and-filter">Search and filter</h2>
      <p>The student list supports powerful search and filtering by name, student ID, guardian name, class, gender, status, and can be sorted by name, enrollment date, or student ID.</p>

      <h2 id="bulk-operations">Bulk operations</h2>
      <p>Select multiple students using checkboxes to perform bulk actions: promote to next class, change class assignment, export to CSV, print student lists, or deactivate enrollment.</p>
    `,
  },

  "core/staff": {
    title: "Staff",
    description: "Manage teacher and staff records and assignments",
    section: "CORE FEATURES",
    headings: [
      { id: "staff-records", title: "Staff records", level: 2 },
      { id: "roles", title: "Staff roles", level: 2 },
      { id: "adding-staff", title: "Adding staff", level: 2 },
      { id: "subject-assignments", title: "Subject assignments", level: 2 },
      { id: "staff-profile", title: "Staff profile", level: 2 },
    ],
    content: `
      <h2 id="staff-records">Staff records</h2>
      <p>The Staff module manages all non-student users in your school. This includes teachers, administrators, finance officers, and support staff.</p>

      <h2 id="roles">Staff roles</h2>
      <p>Decimal uses a role-based access control system. Each staff member is assigned a single role that determines their permissions:</p>
      <ul>
        <li><strong>Principal:</strong> Full access to school settings, reports, and all modules</li>
        <li><strong>Teacher:</strong> Access to assigned classes, attendance, grading, and timetable</li>
        <li><strong>Finance Officer:</strong> Access to fee management, payments, and financial reports</li>
        <li><strong>Secretary:</strong> Access to student records, communications, and daily operations</li>
        <li><strong>Admissions Officer:</strong> Access to applications, enrollment pipeline, and student onboarding</li>
      </ul>

      <h2 id="adding-staff">Adding staff</h2>
      <p>To add a new staff member, navigate to <strong>Staff → Add Staff</strong>, enter their full name and email address, select their role, add their phone number, and for teachers, select the subjects they will teach. Click <strong>"Send Invitation"</strong>.</p>

      <h2 id="subject-assignments">Subject assignments</h2>
      <p>Teachers can be assigned to one or more subjects. Subject assignments determine which classes a teacher can access and which students appear in their attendance and grading views.</p>

      <h2 id="staff-profile">Staff profile</h2>
      <p>Each staff profile includes personal information, employment details, qualifications, assigned subjects, teaching schedule, and activity log.</p>
    `,
  },

  "core/attendance": {
    title: "Attendance",
    description: "Track daily student attendance",
    section: "CORE FEATURES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "taking-attendance", title: "Taking attendance", level: 2 },
      { id: "attendance-statuses", title: "Attendance statuses", level: 2 },
      { id: "viewing-reports", title: "Viewing reports", level: 2 },
      { id: "offline-attendance", title: "Offline attendance", level: 2 },
      { id: "parent-notifications", title: "Parent notifications", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal's attendance module allows teachers to take daily roll calls for their assigned classes. Attendance is recorded per class session and can be viewed in real time by administrators and parents.</p>

      <h2 id="taking-attendance">Taking attendance</h2>
      <p>To take attendance, navigate to <strong>Attendance</strong> from the sidebar, select the class and date, and update the status for each student. The student list loads with all students marked as "Present" by default. Tap or click on students who are absent, late, or excused to change their status, then click <strong>"Save Attendance"</strong>.</p>
      <p>Attendance can only be recorded for the current date or a date within the last 7 days. Future dates are not allowed.</p>

      <h2 id="attendance-statuses">Attendance statuses</h2>
      <table>
        <thead>
          <tr><th>Status</th><th>Code</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>Present</td><td><code>P</code></td><td>Student is present in class</td></tr>
          <tr><td>Absent</td><td><code>A</code></td><td>Student is absent without explanation</td></tr>
          <tr><td>Late</td><td><code>L</code></td><td>Student arrived after the start of class</td></tr>
          <tr><td>Excused</td><td><code>E</code></td><td>Absence is pre-approved or documented</td></tr>
        </tbody>
      </table>

      <h2 id="viewing-reports">Viewing reports</h2>
      <p>Administrators can view attendance reports from <strong>Reports → Attendance</strong> including daily summaries, student history, attendance percentages, class-level trends, and exportable CSV data.</p>

      <h2 id="offline-attendance">Offline attendance</h2>
      <p>When working offline, attendance data is stored in IndexedDB on your device. Once an internet connection is available, the sync engine automatically uploads the data to the server.</p>

      <h2 id="parent-notifications">Parent notifications</h2>
      <p>If parent notifications are enabled, guardians will receive an alert when their child is marked absent. Notifications are sent via the in-app messaging system and optionally via email.</p>
    `,
  },

  "core/academics": {
    title: "Academics",
    description: "Manage classes, subjects, and grading",
    section: "CORE FEATURES",
    headings: [
      { id: "classes", title: "Classes", level: 2 },
      { id: "subjects", title: "Subjects", level: 2 },
      { id: "grading", title: "Grading", level: 2 },
      { id: "academic-years", title: "Academic years", level: 2 },
      { id: "report-cards", title: "Report cards", level: 2 },
    ],
    content: `
      <h2 id="classes">Classes</h2>
      <p>Classes are the fundamental organizational unit in Decimal. Each class represents a group of students who share the same schedule and are assigned to one or more teachers.</p>
      <p>To create a class, navigate to <strong>Academics → Classes</strong>, click <strong>"Add Class"</strong>, enter the class name, assign a class teacher, set the class capacity, and click <strong>"Save"</strong>.</p>

      <h2 id="subjects">Subjects</h2>
      <p>Subjects represent the courses taught in your school. Each subject can be assigned to one or more classes and taught by one or more teachers. Subject configuration includes name, code, type (core or elective), classes, and teachers.</p>

      <h2 id="grading">Grading</h2>
      <p>Decimal supports flexible grading systems including letter grades (A–F), percentage-based, or custom scales. You can configure grade boundaries, comment banks, and weighting for different assessment types (homework, tests, exams).</p>

      <h2 id="academic-years">Academic years</h2>
      <p>An academic year defines the time period for which academic data is tracked. Each academic year contains one or more terms (semesters or terms) with individual date ranges.</p>

      <h2 id="report-cards">Report cards</h2>
      <p>Report cards are generated from the grading data entered by teachers. Decimal produces professional report cards that include student information, subject-by-subject grades and comments, overall position, attendance summary, and teacher and principal remarks.</p>
    `,
  },

  "core/examinations": {
    title: "Examinations",
    description: "Exam management, scheduling, and results",
    section: "CORE FEATURES",
    headings: [
      { id: "creating-exams", title: "Creating examinations", level: 2 },
      { id: "mark-entry", title: "Mark entry", level: 2 },
      { id: "grade-computation", title: "Grade computation", level: 2 },
      { id: "results", title: "Results and publication", level: 2 },
    ],
    content: `
      <h2 id="creating-exams">Creating examinations</h2>
      <p>The Examinations module allows you to create and manage exams for each term. Navigate to <strong>Academics → Examinations</strong>, click <strong>"Add Examination"</strong>, enter the exam name, select the academic year and term, choose which classes and subjects the exam applies to, set the maximum marks and pass marks, and click <strong>"Create"</strong>.</p>

      <h2 id="mark-entry">Mark entry</h2>
      <p>Teachers enter marks for their assigned subjects using a spreadsheet-like interface. Students are listed in rows, assessment components (tests, homework, exams) are in columns, marks are validated against the maximum allowed, and auto-save ensures no data is lost.</p>

      <h2 id="grade-computation">Grade computation</h2>
      <p>Once marks are entered, Decimal automatically computes grades based on your configured grading system. The computation considers component weights, grade boundaries, and subject-level and class-level averages.</p>

      <h2 id="results">Results and publication</h2>
      <p>After marks are finalized, exam results can be published to parents and students via in-app display, PDF export, or email. Before publication, the principal must review and approve the results.</p>
    `,
  },

  "core/timetable": {
    title: "Timetable",
    description: "Build and manage class timetables",
    section: "CORE FEATURES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "creating-timetable", title: "Creating a timetable", level: 2 },
      { id: "periods-and-slots", title: "Periods and slots", level: 2 },
      { id: "conflict-detection", title: "Conflict detection", level: 2 },
      { id: "viewing-timetable", title: "Viewing the timetable", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Timetable module provides a visual interface for building and managing your school's class schedule. It supports drag-and-drop editing, automatic conflict detection, and multiple view modes.</p>

      <h2 id="creating-timetable">Creating a timetable</h2>
      <p>To create a new timetable, navigate to <strong>Academics → Timetable</strong>, click <strong>"New Timetable"</strong>, set the days of the week your school operates, define the daily periods, and assign subjects, teachers, and classes to time slots.</p>

      <h2 id="periods-and-slots">Periods and slots</h2>
      <p>A period is a fixed block of time during the school day. Each slot within a period can be assigned a subject, teacher, and class. Multiple classes can share the same period if they have different subjects and teachers.</p>

      <h2 id="conflict-detection">Conflict detection</h2>
      <p>Decimal automatically detects scheduling conflicts: a teacher assigned to two classes in the same period, a class assigned two subjects in the same period, or a room double-booked. Conflicts are highlighted in red and prevent saving invalid schedules.</p>

      <h2 id="viewing-timetable">Viewing the timetable</h2>
      <p>The timetable can be viewed by class, teacher, full school, or daily view. Timetables can be printed or exported as PDF documents.</p>
    `,
  },

  "core/admissions": {
    title: "Admissions",
    description: "Manage student enrollment and applications",
    section: "CORE FEATURES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "application-process", title: "Application process", level: 2 },
      { id: "reviewing-applications", title: "Reviewing applications", level: 2 },
      { id: "enrollment", title: "Enrollment", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Admissions module provides a structured workflow for processing student applications. It supports the complete lifecycle from application submission to enrollment.</p>

      <h2 id="application-process">Application process</h2>
      <p>Applications can be submitted through an online form, in-app entry, or bulk import. Each application captures the student's personal information, previous school and academic records, guardian contact information, requested class, and supporting documents.</p>

      <h2 id="reviewing-applications">Reviewing applications</h2>
      <table>
        <thead>
          <tr><th>Status</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>Pending</td><td>Application received, awaiting review</td></tr>
          <tr><td>Under review</td><td>Being evaluated by the admissions team</td></tr>
          <tr><td>Interview</td><td>Student/parent interview scheduled</td></tr>
          <tr><td>Approved</td><td>Application accepted, pending enrollment</td></tr>
          <tr><td>Rejected</td><td>Application denied</td></tr>
          <tr><td>Enrolled</td><td>Student has been enrolled</td></tr>
        </tbody>
      </table>

      <h2 id="enrollment">Enrollment</h2>
      <p>Once an application is approved, the admissions officer can enroll the student by assigning them to a class, generating a student ID, creating the student profile, assigning fee structure and generating the first invoice, and sending a welcome notification to the parent.</p>
    `,
  },

  "core/finance": {
    title: "Finance",
    description: "Fee structures, invoicing, and payment tracking",
    section: "CORE FEATURES",
    headings: [
      { id: "fee-structures", title: "Fee structures", level: 2 },
      { id: "invoicing", title: "Invoicing", level: 2 },
      { id: "payments", title: "Recording payments", level: 2 },
      { id: "receipts", title: "Receipts", level: 2 },
      { id: "financial-reports", title: "Financial reports", level: 2 },
    ],
    content: `
      <h2 id="fee-structures">Fee structures</h2>
      <p>A fee structure defines the fees charged to students. Each structure contains one or more fee items with specific amounts. Navigate to <strong>Finance → Fee Structures</strong>, click <strong>"Add Fee Structure"</strong>, name the structure, add fee items (Tuition, Books, Uniform, Activities, etc.), set amounts, and assign to classes or the entire school.</p>

      <h2 id="invoicing">Invoicing</h2>
      <p>Invoices are generated from fee structures and assigned to students. You can generate invoices individually or in bulk, set due dates and payment terms, and add discounts or scholarships.</p>

      <h2 id="payments">Recording payments</h2>
      <p>Payments can be recorded from the Finance module or directly from a student's profile. Select the student and invoice, enter the payment amount, choose the payment method (Cash, Bank Transfer, Mobile Money, Check), add a reference number, and click <strong>"Record Payment"</strong>. Partial payments are supported.</p>

      <h2 id="receipts">Receipts</h2>
      <p>A receipt is automatically generated for each payment including school name and logo, receipt number, student name and ID, payment details, invoice reference, and remaining balance. Receipts can be printed or sent to parents via email.</p>

      <h2 id="financial-reports">Financial reports</h2>
      <p>Generate financial reports to track revenue (total payments received by period), outstanding balances (students with unpaid balances), class revenue, and payment method breakdown. All reports can be exported as CSV or PDF.</p>
    `,
  },

  "core/communication": {
    title: "Communication",
    description: "In-app messaging and announcements",
    section: "CORE FEATURES",
    headings: [
      { id: "announcements", title: "Announcements", level: 2 },
      { id: "messaging", title: "Messaging", level: 2 },
      { id: "parent-communication", title: "Parent communication", level: 2 },
      { id: "notification-channels", title: "Notification channels", level: 2 },
    ],
    content: `
      <h2 id="announcements">Announcements</h2>
      <p>Announcements allow school administrators to broadcast messages to all or selected staff and parents. Navigate to <strong>Communication → Announcements</strong>, click <strong>"New Announcement"</strong>, enter a title and message body, select the target audience, optionally attach files or images, and click <strong>"Publish"</strong> or schedule for later.</p>

      <h2 id="messaging">Messaging</h2>
      <p>The messaging system enables direct communication between staff members and between staff and parents. It supports one-on-one messages, group messages, file attachments, and read receipts.</p>

      <h2 id="parent-communication">Parent communication</h2>
      <p>Teachers can communicate directly with parents of students in their classes for discussing performance, sharing behavior reports, coordinating parent-teacher meetings, and sharing photos from school events.</p>

      <h2 id="notification-channels">Notification channels</h2>
      <p>Decimal supports in-app real-time notifications, email notifications, and push notifications on the Android app. Users can configure their notification preferences from <strong>Settings → Notifications</strong>.</p>
    `,
  },

  "core/reports": {
    title: "Reports",
    description: "Analytics dashboards and report card generation",
    section: "CORE FEATURES",
    headings: [
      { id: "dashboard", title: "Analytics dashboard", level: 2 },
      { id: "report-cards", title: "Report cards", level: 2 },
      { id: "attendance-reports", title: "Attendance reports", level: 2 },
      { id: "financial-reports", title: "Financial reports", level: 2 },
      { id: "export-options", title: "Export options", level: 2 },
    ],
    content: `
      <h2 id="dashboard">Analytics dashboard</h2>
      <p>The dashboard provides a real-time overview of key school metrics: total enrolled students, daily attendance rate, fee collection status, staff count, and upcoming events. Charts and graphs visualize trends over time.</p>

      <h2 id="report-cards">Report cards</h2>
      <p>Report cards are generated per student and include student photo and details, class information, subject-wise grades, overall grade and position, attendance summary, and principal's remarks. They can be customized with your school's branding.</p>

      <h2 id="attendance-reports">Attendance reports</h2>
      <p>Generate attendance reports for any date range including daily attendance by class, student history, class trends, and chronic absentee identification.</p>

      <h2 id="financial-reports">Financial reports</h2>
      <p>Track revenue summary by period, outstanding payments by student, payment collection rates, and fee structure utilization.</p>

      <h2 id="export-options">Export options</h2>
      <table>
        <thead>
          <tr><th>Format</th><th>Use case</th></tr>
        </thead>
        <tbody>
          <tr><td>PDF</td><td>Print-ready documents, report cards</td></tr>
          <tr><td>CSV</td><td>Data analysis in spreadsheets</td></tr>
          <tr><td>Excel</td><td>Advanced data manipulation</td></tr>
        </tbody>
      </table>
    `,
  },
  // ─────────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────────
  "roles/super-admin": {
    title: "Super Admin",
    description: "Platform-level administration and management",
    section: "ROLES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "permissions", title: "Permissions", level: 2 },
      { id: "managing-schools", title: "Managing schools", level: 2 },
      { id: "platform-settings", title: "Platform settings", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Super Admin role has full access to the Decimal platform. This role is typically assigned to the platform owner or primary administrator. Super admins can manage all schools, users, and system settings.</p>
      <blockquote>
        <p><strong>Note:</strong> The Super Admin role is assigned to the first user who creates a school. Additional super admins can be promoted by existing super admins.</p>
      </blockquote>

      <h2 id="permissions">Permissions</h2>
      <p>Super Admins have unrestricted access to all features: create, edit, and delete schools; manage all user accounts across schools; access all modules; configure platform-wide settings; view cross-school analytics; manage billing and subscriptions; access system logs and audit trails.</p>

      <h2 id="managing-schools">Managing schools</h2>
      <p>From the Super Admin dashboard, you can view all registered schools, create new school profiles, edit school details, activate or deactivate schools, view school-level analytics, and switch between schools to access their data.</p>

      <h2 id="platform-settings">Platform settings</h2>
      <p>Super admins can configure platform-wide settings including default roles and permissions, email templates, system-wide grading defaults, data retention policies, and API access and integrations.</p>
    `,
  },

  "roles/principal": {
    title: "Principal",
    description: "School operations management and oversight",
    section: "ROLES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "permissions", title: "Permissions", level: 2 },
      { id: "daily-workflow", title: "Daily workflow", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Principal role provides comprehensive access to all school operations. Principals can manage staff, view academic performance, oversee finances, and make school-wide decisions.</p>

      <h2 id="permissions">Permissions</h2>
      <ul>
        <li>Full access to all student records and academic data</li>
        <li>Manage staff assignments, roles, and permissions</li>
        <li>View and approve exam results before publication</li>
        <li>Access all financial reports and approve large transactions</li>
        <li>Configure school settings, academic years, and grading systems</li>
        <li>Generate and approve report cards</li>
        <li>View attendance trends and analytics</li>
        <li>Manage announcements and school-wide communications</li>
      </ul>

      <h2 id="daily-workflow">Daily workflow</h2>
      <p>A typical day for a principal: review the dashboard for overnight activity and attendance rates in the morning; review pending exam results or report card approvals mid-morning; check financial reports and approve fee waivers in the afternoon; review staff activity and send announcements at end of day.</p>
    `,
  },

  "roles/teacher": {
    title: "Teacher",
    description: "Classroom management, attendance, and grading",
    section: "ROLES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "permissions", title: "Permissions", level: 2 },
      { id: "class-management", title: "Class management", level: 2 },
      { id: "grading-workflow", title: "Grading workflow", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Teacher role is designed for classroom instructors. Teachers can manage their assigned classes, take attendance, enter grades, and communicate with parents.</p>

      <h2 id="permissions">Permissions</h2>
      <ul>
        <li>View and manage assigned classes and students</li>
        <li>Take and edit attendance for assigned classes</li>
        <li>Enter and edit marks for assigned subjects</li>
        <li>View student profiles for assigned classes</li>
        <li>Send messages to parents of assigned students</li>
        <li>View personal timetable and schedule</li>
      </ul>
      <p>Teachers cannot access other teachers' classes, financial data, or school-wide settings.</p>

      <h2 id="class-management">Class management</h2>
      <p>Teachers see only the classes and subjects assigned to them. From their dashboard, they can view the student list, take daily attendance, view student profiles, and access the timetable.</p>

      <h2 id="grading-workflow">Grading workflow</h2>
      <p>When exams are created by the principal, teachers receive a notification to enter marks. Open the exam, select the subject and class, enter marks in the spreadsheet view, save (marks are auto-saved), and review computed grades before final submission. Once submitted, marks cannot be edited without principal approval.</p>
    `,
  },

  "roles/finance": {
    title: "Finance Officer",
    description: "Fee structures, payments, and financial reporting",
    section: "ROLES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "permissions", title: "Permissions", level: 2 },
      { id: "daily-tasks", title: "Daily tasks", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Finance Officer role manages all financial operations in the school, including fee structures, invoicing, payment collection, and financial reporting.</p>

      <h2 id="permissions">Permissions</h2>
      <ul>
        <li>Create and manage fee structures</li>
        <li>Generate invoices for students</li>
        <li>Record and manage payments</li>
        <li>Generate receipts</li>
        <li>View all financial reports</li>
        <li>Manage discounts, scholarships, and fee waivers</li>
        <li>Export financial data</li>
      </ul>
      <p>Finance officers do not have access to academic data (grades, attendance) or school settings.</p>

      <h2 id="daily-tasks">Daily tasks</h2>
      <p>Common daily tasks: record payments received from parents, generate and send receipts, follow up on overdue payments, generate daily collection reports, update fee structures, and export financial data for accounting purposes.</p>
    `,
  },

  "roles/secretary": {
    title: "Secretary",
    description: "Daily operations, student records, and communications",
    section: "ROLES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "permissions", title: "Permissions", level: 2 },
      { id: "typical-tasks", title: "Typical tasks", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Secretary role handles day-to-day administrative tasks including student record management, communications, and scheduling support.</p>

      <h2 id="permissions">Permissions</h2>
      <ul>
        <li>Create, view, and edit student records</li>
        <li>Manage guardian information</li>
        <li>Handle communications and announcements</li>
        <li>View attendance records</li>
        <li>Support admissions processing</li>
        <li>Manage school calendar and events</li>
        <li>Generate basic reports</li>
      </ul>

      <h2 id="typical-tasks">Typical tasks</h2>
      <ul>
        <li>Process new student enrollments and update records</li>
        <li>Maintain accurate guardian contact information</li>
        <li>Send announcements and communications to parents</li>
        <li>Schedule meetings and events</li>
        <li>Print report cards and documents</li>
        <li>Assist with admissions applications</li>
      </ul>
    `,
  },

  "roles/admissions": {
    title: "Admissions Officer",
    description: "Enrollment pipeline and application management",
    section: "ROLES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "permissions", title: "Permissions", level: 2 },
      { id: "workflow", title: "Admissions workflow", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Admissions Officer manages the entire student enrollment pipeline, from application receipt to final enrollment.</p>

      <h2 id="permissions">Permissions</h2>
      <ul>
        <li>Create and manage applications</li>
        <li>Review and update application status</li>
        <li>Approve or reject applications</li>
        <li>Enroll approved students</li>
        <li>Manage the online application form</li>
        <li>View and download supporting documents</li>
        <li>Generate admissions reports</li>
      </ul>

      <h2 id="workflow">Admissions workflow</h2>
      <ol>
        <li><strong>Receive application:</strong> Applications arrive via the online form or are entered manually</li>
        <li><strong>Initial review:</strong> Verify completeness and basic eligibility</li>
        <li><strong>Detailed assessment:</strong> Review academic records, documents, and references</li>
        <li><strong>Decision:</strong> Approve, reject, or request additional information</li>
        <li><strong>Enrollment:</strong> Enroll approved students and assign classes</li>
        <li><strong>Onboarding:</strong> Generate invoices, send welcome packets</li>
      </ol>
    `,
  },

  "roles/parent": {
    title: "Parent",
    description: "Track your child's progress, attendance, and fees",
    section: "ROLES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "permissions", title: "Permissions", level: 2 },
      { id: "parent-portal", title: "Parent portal", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Parent role provides a dedicated portal for parents and guardians to monitor their child's academic progress, attendance, and financial status.</p>

      <h2 id="permissions">Permissions</h2>
      <ul>
        <li>View child's attendance record</li>
        <li>View grades and exam results</li>
        <li>View report cards</li>
        <li>View fee status and payment history</li>
        <li>Receive announcements and notifications</li>
        <li>Communicate with teachers</li>
        <li>View school calendar and events</li>
      </ul>
      <p>Parents can only see information for their linked children. They cannot access other students' data or school-wide settings.</p>

      <h2 id="parent-portal">Parent portal</h2>
      <p>The parent portal provides a simplified dashboard showing overview of attendance, grades, and fees; monthly attendance calendar; subject-wise grades for the current term; outstanding fees and payment history; messages from teachers; and school-wide notifications and events.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // GUIDES
  // ─────────────────────────────────────────────
  "guides/school-setup": {
    title: "School setup guide",
    description: "Complete school configuration from start to finish",
    section: "GUIDES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "step-1", title: "Step 1: Create your school", level: 2 },
      { id: "step-2", title: "Step 2: Configure settings", level: 2 },
      { id: "step-3", title: "Step 3: Add staff", level: 2 },
      { id: "step-4", title: "Step 4: Set up academics", level: 2 },
      { id: "step-5", title: "Step 5: Configure finance", level: 2 },
      { id: "step-6", title: "Step 6: Go live", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>This guide walks you through the complete setup process for a new school in Decimal. Follow these steps in order to ensure everything is configured correctly before going live.</p>

      <h2 id="step-1">Step 1: Create your school</h2>
      <p>Sign up for a Decimal account and create your school profile. You will need your school name and official code, contact information, school type, and optionally a school logo.</p>

      <h2 id="step-2">Step 2: Configure settings</h2>
      <p>Navigate to <strong>Settings</strong> and configure school profile details, academic year and terms, grading system, attendance statuses, and notification preferences.</p>

      <h2 id="step-3">Step 3: Add staff</h2>
      <p>Add all staff members and assign their roles. For teachers, also assign the subjects they teach. Send invitations and ensure everyone can log in before the first day of school.</p>

      <h2 id="step-4">Step 4: Set up academics</h2>
      <p>Create classes, add subjects and assign to classes, assign teachers to subjects, and build the timetable.</p>

      <h2 id="step-5">Step 5: Configure finance</h2>
      <p>Create fee structures for each class or grade level, define payment terms and due dates, set up payment methods, and generate initial invoices.</p>

      <h2 id="step-6">Step 6: Go live</h2>
      <p>Before going live: verify all staff have logged in, take a test attendance, send a test announcement, review all data for accuracy, and brief staff on how to use the platform.</p>
    `,
  },

  "guides/import-students": {
    title: "Import students",
    description: "Bulk student enrollment via CSV import",
    section: "GUIDES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "preparing-data", title: "Preparing your data", level: 2 },
      { id: "csv-format", title: "CSV format", level: 2 },
      { id: "import-process", title: "Import process", level: 2 },
      { id: "troubleshooting", title: "Troubleshooting imports", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The CSV import tool allows you to enroll hundreds of students in minutes. This guide explains how to prepare your data and complete a successful import.</p>

      <h2 id="preparing-data">Preparing your data</h2>
      <p>Before importing, ensure your student data is organized in a spreadsheet (Excel, Google Sheets, or similar). Each row should represent one student.</p>

      <h2 id="csv-format">CSV format</h2>
      <p>Download the template from <strong>Students → Import → Download Template</strong>. The required columns are:</p>
      <table>
        <thead>
          <tr><th>Column</th><th>Required</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>first_name</code></td><td>Yes</td><td>Student's first name</td></tr>
          <tr><td><code>last_name</code></td><td>Yes</td><td>Student's last name</td></tr>
          <tr><td><code>date_of_birth</code></td><td>Yes</td><td>Format: YYYY-MM-DD</td></tr>
          <tr><td><code>gender</code></td><td>Yes</td><td>Male or Female</td></tr>
          <tr><td><code>class_name</code></td><td>Yes</td><td>Must match an existing class name</td></tr>
          <tr><td><code>guardian_name</code></td><td>Yes</td><td>Parent or guardian full name</td></tr>
          <tr><td><code>guardian_phone</code></td><td>Yes</td><td>Guardian contact phone number</td></tr>
          <tr><td><code>guardian_email</code></td><td>No</td><td>Guardian email (for parent portal)</td></tr>
          <tr><td><code>student_id</code></td><td>No</td><td>Custom ID (auto-generated if empty)</td></tr>
        </tbody>
      </table>

      <h2 id="import-process">Import process</h2>
      <ol>
        <li>Navigate to <strong>Students → Import</strong></li>
        <li>Upload your CSV file</li>
        <li>Map the columns to the required fields</li>
        <li>Review the preview — any errors are highlighted in red</li>
        <li>Fix any issues and re-upload if necessary</li>
        <li>Click <strong>"Import"</strong> to complete</li>
      </ol>

      <h2 id="troubleshooting">Troubleshooting imports</h2>
      <ul>
        <li><strong>"Class not found":</strong> Ensure the class name in your CSV exactly matches an existing class in Decimal (including capitalization and spacing)</li>
        <li><strong>"Invalid date format":</strong> Use YYYY-MM-DD format (e.g., 2015-03-15)</li>
        <li><strong>"Duplicate student":</strong> A student with the same name and date of birth already exists</li>
        <li><strong>"Missing required field":</strong> Check that all required columns have values for every row</li>
      </ul>
    `,
  },

  "guides/academic-years": {
    title: "Academic years guide",
    description: "Configure terms, semesters, and academic periods",
    section: "GUIDES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "creating-year", title: "Creating an academic year", level: 2 },
      { id: "terms", title: "Setting up terms", level: 2 },
      { id: "rollover", title: "Year-end rollover", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Academic years define the time periods for which academic data is tracked. Each year contains one or more terms, and all classes, subjects, and grades are scoped to a specific academic year.</p>

      <h2 id="creating-year">Creating an academic year</h2>
      <ol>
        <li>Navigate to <strong>Settings → Academic Years</strong></li>
        <li>Click <strong>"Add Academic Year"</strong></li>
        <li>Enter the year name (e.g., "2024/2025")</li>
        <li>Set the start and end dates</li>
        <li>Mark it as the current year if applicable</li>
        <li>Click <strong>"Save"</strong></li>
      </ol>

      <h2 id="terms">Setting up terms</h2>
      <p>Each academic year can have multiple terms. Common configurations include 3 terms (Sep–Dec, Jan–Mar, Apr–Jul), 2 semesters, or 4 quarters. Each term has a start date, end date, and an <code>is_current</code> flag indicating the active term.</p>

      <h2 id="rollover">Year-end rollover</h2>
      <p>At the end of each academic year, create the new academic year and terms, promote students to their next class, copy or recreate class and subject assignments, carry forward fee structures, and archive the previous year's data (read-only access preserved).</p>
    `,
  },

  "guides/grading": {
    title: "Grading system guide",
    description: "Set up and configure grading scales",
    section: "GUIDES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "grading-scales", title: "Grading scales", level: 2 },
      { id: "configuring-weights", title: "Configuring assessment weights", level: 2 },
      { id: "comment-banks", title: "Comment banks", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>A grading system defines how marks are converted into grades. Decimal supports multiple grading systems, so different classes or subjects can use different scales if needed.</p>

      <h2 id="grading-scales">Grading scales</h2>
      <p>To create a grading scale, navigate to <strong>Settings → Grading</strong>, click <strong>"Add Grading System"</strong>, name the system, and define the grade boundaries.</p>
      <table>
        <thead>
          <tr><th>Grade</th><th>Min %</th><th>Max %</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>A</td><td>80</td><td>100</td><td>Excellent</td></tr>
          <tr><td>B</td><td>70</td><td>79</td><td>Very Good</td></tr>
          <tr><td>C</td><td>60</td><td>69</td><td>Good</td></tr>
          <tr><td>D</td><td>50</td><td>59</td><td>Fair</td></tr>
          <tr><td>E</td><td>40</td><td>49</td><td>Poor</td></tr>
          <tr><td>F</td><td>0</td><td>39</td><td>Fail</td></tr>
        </tbody>
      </table>

      <h2 id="configuring-weights">Configuring assessment weights</h2>
      <p>Define how different assessment components contribute to the final grade: Classwork/Homework (10–20%), Continuous Assessment (20–30%), and Exams (50–70%). Weights are configured per subject.</p>

      <h2 id="comment-banks">Comment banks</h2>
      <p>Comment banks are collections of pre-written teacher comments organized by category: academic performance, behavior and conduct, participation and effort, and areas for improvement. Teachers can also write custom comments for individual students.</p>
    `,
  },

  "guides/create-timetable": {
    title: "Create a timetable",
    description: "Build your class schedule step by step",
    section: "GUIDES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "defining-periods", title: "Defining periods", level: 2 },
      { id: "assigning-slots", title: "Assigning slots", level: 2 },
      { id: "finalizing", title: "Finalizing the timetable", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>This guide walks you through creating a complete school timetable from scratch.</p>

      <h2 id="defining-periods">Defining periods</h2>
      <p>Start by defining the daily schedule structure. Navigate to <strong>Academics → Timetable</strong>, click <strong>"Configure Periods"</strong>, set the school start and end times, define each period with start and end times, and mark break periods.</p>
      <pre><code>Period 1: 08:00 - 08:45
Period 2: 08:45 - 09:30
Break:    09:30 - 09:45
Period 3: 09:45 - 10:30
Period 4: 10:30 - 11:15
Lunch:    11:15 - 12:00
Period 5: 12:00 - 12:45
Period 6: 12:45 - 13:30</code></pre>

      <h2 id="assigning-slots">Assigning slots</h2>
      <p>Drag and drop subjects, teachers, and classes into the timetable grid. The system checks for conflicts in real time. For each slot, you need a subject, teacher, class, and optionally a room.</p>

      <h2 id="finalizing">Finalizing the timetable</h2>
      <p>Once all slots are filled, review the conflict-free indicator, check each teacher's total weekly hours, verify each class has a balanced schedule, and click <strong>"Publish Timetable"</strong>.</p>
    `,
  },

  "guides/manage-fees": {
    title: "Manage school fees",
    description: "Fee structures, billing, and payment collection",
    section: "GUIDES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "creating-structures", title: "Creating fee structures", level: 2 },
      { id: "generating-invoices", title: "Generating invoices", level: 2 },
      { id: "collecting-payments", title: "Collecting payments", level: 2 },
      { id: "handling-arrears", title: "Handling arrears", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Effective fee management is critical for school operations. This guide covers the complete fee lifecycle from structure creation to payment collection.</p>

      <h2 id="creating-structures">Creating fee structures</h2>
      <p>Fee structures define what fees are charged. Navigate to <strong>Finance → Fee Structures</strong>, click <strong>"Add Fee Structure"</strong>, name it, add line items (Tuition, Lab Fee, Activity Fee), set amounts, and assign to the appropriate class(es).</p>

      <h2 id="generating-invoices">Generating invoices</h2>
      <p>Once fee structures are in place, generate invoices individually from a student's profile or in bulk from Finance → Invoices. Invoices include the fee breakdown, total amount, due date, and payment instructions.</p>

      <h2 id="collecting-payments">Collecting payments</h2>
      <p>Record payments as they are received: select the student and invoice, enter the amount paid, select the payment method, add a reference number, and save. The invoice balance updates automatically.</p>

      <h2 id="handling-arrears">Handling arrears</h2>
      <p>For students with overdue payments: use the Outstanding Report to identify overdue accounts, send payment reminders, apply late fees if configured, and generate statements for individual students.</p>
    `,
  },

  "guides/generate-reports": {
    title: "Generate reports",
    description: "Create report cards and academic analytics",
    section: "GUIDES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "report-card-process", title: "Report card generation", level: 2 },
      { id: "customizing-reports", title: "Customizing report cards", level: 2 },
      { id: "analytics-reports", title: "Analytics reports", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal generates professional report cards and analytics reports. This guide covers the report generation process.</p>

      <h2 id="report-card-process">Report card generation</h2>
      <ol>
        <li>Ensure all marks have been entered and submitted by teachers</li>
        <li>Navigate to <strong>Reports → Report Cards</strong></li>
        <li>Select the academic year, term, and class</li>
        <li>Click <strong>"Generate Report Cards"</strong></li>
        <li>Review a sample report card for accuracy</li>
        <li>Approve and publish</li>
      </ol>
      <p>Report cards can be downloaded as PDF files for printing or shared digitally with parents.</p>

      <h2 id="customizing-reports">Customizing report cards</h2>
      <p>Customize report card templates from <strong>Settings → Report Card Template</strong>: add your school logo and header, choose which sections to include, customize the layout and branding colors, and add custom sections.</p>

      <h2 id="analytics-reports">Analytics reports</h2>
      <p>Beyond report cards, Decimal provides class performance analysis, subject comparison, student progress tracking, and attendance analytics with patterns, trends, and chronic absenteeism alerts.</p>
    `,
  },

  "guides/manage-staff": {
    title: "Manage staff",
    description: "Staff onboarding, roles, and performance tracking",
    section: "GUIDES",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "onboarding", title: "Staff onboarding", level: 2 },
      { id: "managing-roles", title: "Managing roles", level: 2 },
      { id: "deactivating", title: "Deactivating staff", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Effective staff management ensures your school runs smoothly. This guide covers the complete staff lifecycle.</p>

      <h2 id="onboarding">Staff onboarding</h2>
      <p>When onboarding new staff: create their profile with personal and employment details, assign the appropriate role, for teachers assign subjects and classes, send the invitation email, follow up to ensure they set up their account, and provide a brief orientation on using Decimal.</p>

      <h2 id="managing-roles">Managing roles</h2>
      <p>Roles can be updated as staff responsibilities change. Open the staff member's profile, click <strong>"Edit Role"</strong>, select the new role, update subject assignments if applicable, and save changes. Role changes take effect immediately.</p>

      <h2 id="deactivating">Deactivating staff</h2>
      <p>When a staff member leaves the school, open their profile, click <strong>"Deactivate"</strong>, set the last working day, and their account is deactivated. Deactivated staff records are preserved for historical reference.</p>
    `,
  },
  // ─────────────────────────────────────────────
  // CONCEPTS
  // ─────────────────────────────────────────────
  "concepts/roles-permissions": {
    title: "Roles & permissions",
    description: "How Decimal's role-based access control works",
    section: "CONCEPTS",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "role-hierarchy", title: "Role hierarchy", level: 2 },
      { id: "permission-model", title: "Permission model", level: 2 },
      { id: "customization", title: "Customization", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal uses a role-based access control (RBAC) system to ensure users can only access the features and data relevant to their responsibilities. Each user is assigned a single role that determines their permissions.</p>

      <h2 id="role-hierarchy">Role hierarchy</h2>
      <pre><code>Super Admin
├── Principal
│   ├── Teacher
│   ├── Finance Officer
│   ├── Secretary
│   └── Admissions Officer
└── Parent</code></pre>
      <ul>
        <li><strong>Super Admin:</strong> Platform-wide access across all schools</li>
        <li><strong>Principal:</strong> Full school-level access</li>
        <li><strong>Staff roles:</strong> Scoped to their specific responsibilities</li>
        <li><strong>Parent:</strong> Read-only access to their child's data</li>
      </ul>

      <h2 id="permission-model">Permission model</h2>
      <p>Permissions are defined at the module level. Each role has a set of allowed actions (create, read, update, delete) for each module:</p>
      <table>
        <thead>
          <tr><th>Module</th><th>Teacher</th><th>Finance</th><th>Secretary</th><th>Principal</th></tr>
        </thead>
        <tbody>
          <tr><td>Students</td><td>Read (assigned)</td><td>Read</td><td>Full CRUD</td><td>Full CRUD</td></tr>
          <tr><td>Attendance</td><td>Create/Edit (assigned)</td><td>Read</td><td>Read</td><td>Full CRUD</td></tr>
          <tr><td>Grades</td><td>Create/Edit (assigned)</td><td>None</td><td>Read</td><td>Full CRUD</td></tr>
          <tr><td>Finance</td><td>None</td><td>Full CRUD</td><td>Read</td><td>Full CRUD</td></tr>
          <tr><td>Settings</td><td>None</td><td>None</td><td>None</td><td>Full CRUD</td></tr>
        </tbody>
      </table>

      <h2 id="customization">Customization</h2>
      <p>While Decimal ships with predefined roles, the super admin can fine-tune permissions for each role from <strong>Settings → Permissions</strong>. This allows schools to adjust access levels to match their specific organizational structure.</p>
    `,
  },

  "concepts/academic-years": {
    title: "Academic years",
    description: "How academic periods and terms work in Decimal",
    section: "CONCEPTS",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "structure", title: "Academic year structure", level: 2 },
      { id: "data-scoping", title: "Data scoping", level: 2 },
      { id: "historical-data", title: "Historical data", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Academic years are the temporal containers for all academic data in Decimal. Understanding how they work is essential for managing your school's data correctly.</p>

      <h2 id="structure">Academic year structure</h2>
      <pre><code>Academic Year: 2024/2025
├── Term 1 (Sep 1 – Dec 15)
│   ├── Mid-Term Exam
│   └── End-of-Term Exam
├── Term 2 (Jan 6 – Mar 28)
│   ├── Mid-Term Exam
│   └── End-of-Term Exam
└── Term 3 (Apr 14 – Jul 4)
    ├── Mid-Term Exam
    └── Final Exam</code></pre>
      <p>Each term has a <code>is_current</code> flag indicating the active term. Only one term can be current at a time.</p>

      <h2 id="data-scoping">Data scoping</h2>
      <p>All academic data is scoped to an academic year: class definitions are per-year, subject assignments are per-year, marks and grades are per-term within a year, attendance records are dated but reported per-term, and there is one timetable per academic year.</p>

      <h2 id="historical-data">Historical data</h2>
      <p>Previous academic years are preserved as read-only. You can view historical grades and attendance, generate reports for past years, compare current performance with historical data, and access archived student profiles. Historical data cannot be modified, ensuring data integrity.</p>
    `,
  },

  "concepts/grading": {
    title: "Grading",
    description: "How grading systems and grade computation work",
    section: "CONCEPTS",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "grade-computation", title: "Grade computation", level: 2 },
      { id: "multiple-systems", title: "Multiple grading systems", level: 2 },
      { id: "report-card-grade", title: "Report card grades", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal's grading system converts raw marks into meaningful grades using configurable grade boundaries and assessment weights.</p>

      <h2 id="grade-computation">Grade computation</h2>
      <p>The final grade for a subject is computed using weighted components:</p>
      <pre><code>Final Mark = (Classwork x Weight_CW) + (CA x Weight_CA) + (Exam x Weight_Exam)

Example:
  Classwork: 85 x 0.15 = 12.75
  CA:        72 x 0.25 = 18.00
  Exam:      68 x 0.60 = 40.80
  ─────────────────────────────
  Final Mark:            71.55 → Grade: B</code></pre>

      <h2 id="multiple-systems">Multiple grading systems</h2>
      <ul>
        <li><strong>Letter grades:</strong> A, B, C, D, E, F with configurable boundaries</li>
        <li><strong>Percentage:</strong> Raw percentage display</li>
        <li><strong>GPA Scale:</strong> 4.0 scale (common in universities)</li>
        <li><strong>Custom:</strong> Define your own grade labels and boundaries</li>
      </ul>

      <h2 id="report-card-grade">Report card grades</h2>
      <p>On report cards, each subject displays the letter grade, the numeric mark, the teacher's comment, the subject class average, and the student's position in the subject.</p>
    `,
  },

  "concepts/attendance": {
    title: "Attendance",
    description: "The attendance tracking model and data flow",
    section: "CONCEPTS",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "data-model", title: "Data model", level: 2 },
      { id: "reporting", title: "Attendance reporting", level: 2 },
      { id: "notifications", title: "Absent notifications", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Attendance tracking in Decimal is class-based. Each class session has its own attendance record, and teachers mark the status of each student for that session.</p>

      <h2 id="data-model">Data model</h2>
      <pre><code>Attendance Record
├── date: 2024-09-15
├── class_id: "cls_7a"
├── teacher_id: "usr_t001"
├── subject_id: "subj_math"
└── entries:
    ├── student_id: "stu_001", status: "present"
    ├── student_id: "stu_002", status: "absent"
    ├── student_id: "stu_003", status: "late"
    └── student_id: "stu_004", status: "excused"</code></pre>

      <h2 id="reporting">Attendance reporting</h2>
      <p>Attendance data feeds into several reports: daily summary by class, student history over time, class trends over a term, and school-wide overall attendance rate.</p>

      <h2 id="notifications">Absent notifications</h2>
      <p>When a student is marked absent, the system can automatically notify their parent/guardian via in-app notification or email. Notifications can be disabled per school from <strong>Settings → Notifications</strong>.</p>
    `,
  },

  "concepts/fees": {
    title: "Fee structures",
    description: "How fees, invoicing, and payments work",
    section: "CONCEPTS",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "fee-lifecycle", title: "Fee lifecycle", level: 2 },
      { id: "payment-methods", title: "Payment methods", level: 2 },
      { id: "discounts", title: "Discounts and scholarships", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal's finance module manages the complete fee lifecycle from structure definition to payment collection and reporting.</p>

      <h2 id="fee-lifecycle">Fee lifecycle</h2>
      <pre><code>Fee Structure → Invoice → Payment → Receipt
     │              │          │          │
     │              │          │          └── Generated automatically
     │              │          └── Recorded by finance officer
     │              └── Generated from structure + student
     └── Defined by admin</code></pre>

      <h2 id="payment-methods">Payment methods</h2>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>Cash</td><td>Physical cash payment recorded manually</td></tr>
          <tr><td>Bank Transfer</td><td>Direct bank deposit with reference number</td></tr>
          <tr><td>Mobile Money</td><td>Mobile money payment with transaction ID</td></tr>
          <tr><td>Check</td><td>Check payment with check number</td></tr>
        </tbody>
      </table>

      <h2 id="discounts">Discounts and scholarships</h2>
      <ul>
        <li><strong>Percentage discount:</strong> Reduce the total by a percentage (e.g., 10% early payment discount)</li>
        <li><strong>Fixed amount:</strong> Reduce by a specific amount (e.g., 0 scholarship)</li>
        <li><strong>Full waiver:</strong> Waive the entire fee (for sponsored students)</li>
      </ul>
      <p>Discounts are reflected on the invoice and receipt, providing a clear audit trail.</p>
    `,
  },

  "concepts/timetable": {
    title: "Timetable engine",
    description: "How the scheduling algorithm works",
    section: "CONCEPTS",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "scheduling-model", title: "Scheduling model", level: 2 },
      { id: "conflict-detection", title: "Conflict detection", level: 2 },
      { id: "constraints", title: "Scheduling constraints", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The timetable engine manages class scheduling with real-time conflict detection and constraint validation.</p>

      <h2 id="scheduling-model">Scheduling model</h2>
      <pre><code>TimeSlot
├── day: "monday"
├── period: "period_1"
├── start_time: "08:00"
├── end_time: "08:45"
└── assignments:
    ├── class_id: "cls_7a"
    ├── subject_id: "subj_math"
    ├── teacher_id: "usr_t001"
    └── room: "rm_101"</code></pre>

      <h2 id="conflict-detection">Conflict detection</h2>
      <p>The system checks for three types of conflicts: teacher conflict (same teacher at same time), class conflict (same class at same time), and room conflict (same room at same time). Conflicts are detected in real time and prevent saving invalid schedules.</p>

      <h2 id="constraints">Scheduling constraints</h2>
      <ul>
        <li>Each teacher can teach a maximum number of periods per day</li>
        <li>Each class must have at least one period of each core subject per week</li>
        <li>Break periods cannot have class assignments</li>
        <li>Maximum consecutive periods for a single teacher</li>
      </ul>
    `,
  },

  "concepts/offline": {
    title: "Offline-first",
    description: "How Decimal works without internet and syncs data",
    section: "CONCEPTS",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "how-it-works", title: "How offline mode works", level: 2 },
      { id: "what-works-offline", title: "What works offline", level: 2 },
      { id: "sync-process", title: "The sync process", level: 2 },
      { id: "conflict-resolution", title: "Conflict resolution", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal is designed as an offline-first application. This means you can continue working even when your internet connection is unreliable or unavailable. Data is stored locally on your device and synchronized when connectivity is restored.</p>

      <h2 id="how-it-works">How offline mode works</h2>
      <p>Decimal uses IndexedDB (a browser-based database) to store data locally. When you perform an action offline, the action is saved to IndexedDB immediately, a sync record is created in the sync queue, when connectivity is restored the sync engine processes the queue, and data is uploaded to the server in the order it was created.</p>

      <h2 id="what-works-offline">What works offline</h2>
      <table>
        <thead>
          <tr><th>Feature</th><th>Offline support</th></tr>
        </thead>
        <tbody>
          <tr><td>Take attendance</td><td>Yes — syncs when online</td></tr>
          <tr><td>Enter grades</td><td>Yes — syncs when online</td></tr>
          <tr><td>View student records</td><td>Yes — uses cached data</td></tr>
          <tr><td>View timetable</td><td>Yes — uses cached data</td></tr>
          <tr><td>Record payments</td><td>Yes — syncs when online</td></tr>
          <tr><td>Generate report cards</td><td>No — requires server</td></tr>
          <tr><td>Send emails</td><td>No — queued for when online</td></tr>
        </tbody>
      </table>

      <h2 id="sync-process">The sync process</h2>
      <p>The sync engine runs in the background: automatically syncs whenever connectivity is detected, can be triggered manually via the sync icon, and the sync indicator shows pending items in the queue.</p>

      <h2 id="conflict-resolution">Conflict resolution</h2>
      <p>If the same data is modified on two devices while offline, the sync engine uses a "last write wins" strategy. The most recent change (by timestamp) takes precedence. In case of a conflict, the user is notified and can manually resolve it.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // REFERENCE
  // ─────────────────────────────────────────────
  "reference/settings": {
    title: "Settings",
    description: "School configuration options reference",
    section: "REFERENCE",
    headings: [
      { id: "school-profile", title: "School profile settings", level: 2 },
      { id: "academic-settings", title: "Academic settings", level: 2 },
      { id: "notification-settings", title: "Notification settings", level: 2 },
      { id: "display-settings", title: "Display settings", level: 2 },
    ],
    content: `
      <h2 id="school-profile">School profile settings</h2>
      <table>
        <thead>
          <tr><th>Setting</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>school_name</code></td><td>Text</td><td>Official name of the school</td></tr>
          <tr><td><code>school_code</code></td><td>Text</td><td>Unique school identifier</td></tr>
          <tr><td><code>school_type</code></td><td>Enum</td><td>Primary, Secondary, Combined, Tertiary</td></tr>
          <tr><td><code>email</code></td><td>Email</td><td>School contact email</td></tr>
          <tr><td><code>phone</code></td><td>Text</td><td>School contact phone</td></tr>
          <tr><td><code>address</code></td><td>Text</td><td>Physical address</td></tr>
          <tr><td><code>logo_url</code></td><td>URL</td><td>School logo image URL</td></tr>
          <tr><td><code>motto</code></td><td>Text</td><td>School motto</td></tr>
        </tbody>
      </table>

      <h2 id="academic-settings">Academic settings</h2>
      <table>
        <thead>
          <tr><th>Setting</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>current_academic_year</code></td><td>Reference</td><td>The currently active academic year</td></tr>
          <tr><td><code>current_term</code></td><td>Reference</td><td>The currently active term</td></tr>
          <tr><td><code>grading_system</code></td><td>Reference</td><td>Default grading system for the school</td></tr>
          <tr><td><code>attendance_enabled</code></td><td>Boolean</td><td>Whether attendance tracking is enabled</td></tr>
        </tbody>
      </table>

      <h2 id="notification-settings">Notification settings</h2>
      <table>
        <thead>
          <tr><th>Setting</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>email_notifications</code></td><td>Boolean</td><td>Enable email notifications</td></tr>
          <tr><td><code>absence_alerts</code></td><td>Boolean</td><td>Notify parents when student is absent</td></tr>
          <tr><td><code>payment_alerts</code></td><td>Boolean</td><td>Notify on payment received</td></tr>
        </tbody>
      </table>

      <h2 id="display-settings">Display settings</h2>
      <table>
        <thead>
          <tr><th>Setting</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>theme</code></td><td>Enum</td><td>light, dark, system</td></tr>
          <tr><td><code>language</code></td><td>Enum</td><td>Interface language</td></tr>
          <tr><td><code>timezone</code></td><td>Text</td><td>School timezone (e.g., Africa/Nairobi)</td></tr>
          <tr><td><code>date_format</code></td><td>Enum</td><td>DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD</td></tr>
        </tbody>
      </table>
    `,
  },

  "reference/permissions": {
    title: "Permissions",
    description: "Complete role permission matrix",
    section: "REFERENCE",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "student-permissions", title: "Student module", level: 2 },
      { id: "academic-permissions", title: "Academic module", level: 2 },
      { id: "finance-permissions", title: "Finance module", level: 2 },
      { id: "system-permissions", title: "System module", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>This page lists the exact permissions for each role across all modules. Use this as a reference when configuring access for your school.</p>

      <h2 id="student-permissions">Student module</h2>
      <table>
        <thead>
          <tr><th>Action</th><th>Super Admin</th><th>Principal</th><th>Teacher</th><th>Secretary</th><th>Finance</th><th>Parent</th></tr>
        </thead>
        <tbody>
          <tr><td>View students</td><td>All</td><td>All</td><td>Assigned</td><td>All</td><td>All</td><td>Child only</td></tr>
          <tr><td>Create student</td><td>Yes</td><td>Yes</td><td>No</td><td>Yes</td><td>No</td><td>No</td></tr>
          <tr><td>Edit student</td><td>Yes</td><td>Yes</td><td>No</td><td>Yes</td><td>No</td><td>No</td></tr>
          <tr><td>Delete student</td><td>Yes</td><td>Yes</td><td>No</td><td>No</td><td>No</td><td>No</td></tr>
        </tbody>
      </table>

      <h2 id="academic-permissions">Academic module</h2>
      <table>
        <thead>
          <tr><th>Action</th><th>Super Admin</th><th>Principal</th><th>Teacher</th></tr>
        </thead>
        <tbody>
          <tr><td>Take attendance</td><td>Yes</td><td>Yes</td><td>Assigned classes</td></tr>
          <tr><td>Enter marks</td><td>Yes</td><td>Yes</td><td>Assigned subjects</td></tr>
          <tr><td>Approve results</td><td>Yes</td><td>Yes</td><td>No</td></tr>
          <tr><td>Generate report cards</td><td>Yes</td><td>Yes</td><td>No</td></tr>
          <tr><td>Create exams</td><td>Yes</td><td>Yes</td><td>No</td></tr>
        </tbody>
      </table>

      <h2 id="finance-permissions">Finance module</h2>
      <table>
        <thead>
          <tr><th>Action</th><th>Super Admin</th><th>Principal</th><th>Finance</th></tr>
        </thead>
        <tbody>
          <tr><td>View fee structures</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Create fee structures</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Record payments</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Generate receipts</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>View financial reports</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
        </tbody>
      </table>

      <h2 id="system-permissions">System module</h2>
      <table>
        <thead>
          <tr><th>Action</th><th>Super Admin</th><th>Principal</th></tr>
        </thead>
        <tbody>
          <tr><td>Manage school settings</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Manage staff roles</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Manage grading systems</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>View audit logs</td><td>Yes</td><td>No</td></tr>
          <tr><td>Manage schools</td><td>Yes</td><td>No</td></tr>
        </tbody>
      </table>
    `,
  },

  "reference/student-fields": {
    title: "Student fields",
    description: "Complete list of student record fields",
    section: "REFERENCE",
    headings: [
      { id: "personal-fields", title: "Personal information", level: 2 },
      { id: "academic-fields", title: "Academic information", level: 2 },
      { id: "guardian-fields", title: "Guardian fields", level: 2 },
      { id: "medical-fields", title: "Medical fields", level: 2 },
    ],
    content: `
      <h2 id="personal-fields">Personal information</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>first_name</code></td><td>Text</td><td>Yes</td><td>Student's first name</td></tr>
          <tr><td><code>last_name</code></td><td>Text</td><td>Yes</td><td>Student's last name</td></tr>
          <tr><td><code>date_of_birth</code></td><td>Date</td><td>Yes</td><td>Format: YYYY-MM-DD</td></tr>
          <tr><td><code>gender</code></td><td>Enum</td><td>Yes</td><td>male, female</td></tr>
          <tr><td><code>nationality</code></td><td>Text</td><td>No</td><td>Country of citizenship</td></tr>
          <tr><td><code>blood_group</code></td><td>Text</td><td>No</td><td>Blood type (A+, B-, etc.)</td></tr>
          <tr><td><code>address</code></td><td>Text</td><td>No</td><td>Home address</td></tr>
          <tr><td><code>photo_url</code></td><td>URL</td><td>No</td><td>Student profile photo</td></tr>
        </tbody>
      </table>

      <h2 id="academic-fields">Academic information</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>student_id</code></td><td>Text</td><td>Auto</td><td>Auto-generated unique identifier</td></tr>
          <tr><td><code>class_id</code></td><td>Reference</td><td>Yes</td><td>Assigned class</td></tr>
          <tr><td><code>enrollment_date</code></td><td>Date</td><td>Auto</td><td>Date of enrollment</td></tr>
          <tr><td><code>status</code></td><td>Enum</td><td>Auto</td><td>active, inactive, graduated</td></tr>
        </tbody>
      </table>

      <h2 id="guardian-fields">Guardian fields</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Required</th></tr>
        </thead>
        <tbody>
          <tr><td><code>guardian_name</code></td><td>Text</td><td>Yes</td></tr>
          <tr><td><code>guardian_relationship</code></td><td>Enum</td><td>Yes (Father, Mother, Guardian, Other)</td></tr>
          <tr><td><code>guardian_phone</code></td><td>Text</td><td>Yes</td></tr>
          <tr><td><code>guardian_email</code></td><td>Email</td><td>No</td></tr>
          <tr><td><code>guardian_occupation</code></td><td>Text</td><td>No</td></tr>
        </tbody>
      </table>

      <h2 id="medical-fields">Medical fields</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Required</th></tr>
        </thead>
        <tbody>
          <tr><td><code>allergies</code></td><td>Text</td><td>No</td></tr>
          <tr><td><code>medical_conditions</code></td><td>Text</td><td>No</td></tr>
          <tr><td><code>medications</code></td><td>Text</td><td>No</td></tr>
          <tr><td><code>emergency_contact</code></td><td>Text</td><td>No</td></tr>
        </tbody>
      </table>
    `,
  },

  "reference/attendance-statuses": {
    title: "Attendance statuses",
    description: "Attendance state values and their meanings",
    section: "REFERENCE",
    headings: [
      { id: "statuses", title: "Status values", level: 2 },
      { id: "reporting-impact", title: "Reporting impact", level: 2 },
    ],
    content: `
      <h2 id="statuses">Status values</h2>
      <table>
        <thead>
          <tr><th>Status</th><th>Code</th><th>Description</th><th>Color</th></tr>
        </thead>
        <tbody>
          <tr><td>Present</td><td><code>P</code></td><td>Student is present in class for the full session</td><td>Green</td></tr>
          <tr><td>Absent</td><td><code>A</code></td><td>Student did not attend the session without prior notice</td><td>Red</td></tr>
          <tr><td>Late</td><td><code>L</code></td><td>Student arrived after the official start time</td><td>Yellow</td></tr>
          <tr><td>Excused</td><td><code>E</code></td><td>Absence is pre-approved or documented (medical, official, etc.)</td><td>Blue</td></tr>
        </tbody>
      </table>

      <h2 id="reporting-impact">Reporting impact</h2>
      <ul>
        <li><strong>Present:</strong> Counts toward total days present. No notification sent.</li>
        <li><strong>Absent:</strong> Counts toward total days absent. Triggers parent notification if enabled. Contributes to chronic absenteeism alerts.</li>
        <li><strong>Late:</strong> Counts as present but flagged as late. Late arrivals are tracked separately for tardiness reporting.</li>
        <li><strong>Excused:</strong> Counts as present. Does not trigger absence notifications. Documented as an approved absence.</li>
      </ul>
      <p>Attendance percentages are calculated as: <code>(Present + Late + Excused) / Total School Days x 100</code></p>
      <p>Only <strong>Absent</strong> status negatively impacts the attendance percentage.</p>
    `,
  },

  "reference/grading-systems": {
    title: "Grading systems",
    description: "Grading scale reference and comparison",
    section: "REFERENCE",
    headings: [
      { id: "standard-scale", title: "Standard A-F scale", level: 2 },
      { id: "percentage-scale", title: "Percentage scale", level: 2 },
      { id: "gpa-scale", title: "GPA 4.0 scale", level: 2 },
      { id: "custom", title: "Custom scales", level: 2 },
    ],
    content: `
      <h2 id="standard-scale">Standard A-F scale</h2>
      <table>
        <thead>
          <tr><th>Grade</th><th>Min %</th><th>Max %</th><th>GPA Points</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>A</td><td>80</td><td>100</td><td>4.0</td><td>Excellent</td></tr>
          <tr><td>B</td><td>70</td><td>79</td><td>3.0</td><td>Very Good</td></tr>
          <tr><td>C</td><td>60</td><td>69</td><td>2.0</td><td>Good</td></tr>
          <tr><td>D</td><td>50</td><td>59</td><td>1.0</td><td>Fair</td></tr>
          <tr><td>E</td><td>40</td><td>49</td><td>0.5</td><td>Poor</td></tr>
          <tr><td>F</td><td>0</td><td>39</td><td>0.0</td><td>Fail</td></tr>
        </tbody>
      </table>

      <h2 id="percentage-scale">Percentage scale</h2>
      <p>Some schools prefer to display raw percentages without letter grades. In this mode, the numeric mark is displayed directly on report cards.</p>

      <h2 id="gpa-scale">GPA 4.0 scale</h2>
      <p>Used in tertiary institutions. The GPA is calculated as the weighted average of grade points:</p>
      <pre><code>GPA = Sum(Grade Points x Credit Hours) / Sum(Credit Hours)

Example:
  Mathematics (3 credits): A = 4.0 x 3 = 12.0
  English (3 credits):      B = 3.0 x 3 = 9.0
  Science (4 credits):      C = 2.0 x 4 = 8.0
  ─────────────────────────────────────────
  Total credits: 10
  Total points:  29.0
  GPA: 29.0 / 10 = 2.9</code></pre>

      <h2 id="custom">Custom scales</h2>
      <p>Decimal allows you to define completely custom grading scales with custom grade labels (e.g., Distinction, Merit, Pass, Fail), custom numeric boundaries, non-standard grade point values, and specific point ranges.</p>
    `,
  },

  "reference/fee-fields": {
    title: "Fee fields",
    description: "Fee structure and invoice field reference",
    section: "REFERENCE",
    headings: [
      { id: "fee-structure-fields", title: "Fee structure fields", level: 2 },
      { id: "invoice-fields", title: "Invoice fields", level: 2 },
      { id: "payment-fields", title: "Payment fields", level: 2 },
      { id: "receipt-fields", title: "Receipt fields", level: 2 },
    ],
    content: `
      <h2 id="fee-structure-fields">Fee structure fields</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>name</code></td><td>Text</td><td>Fee structure name (e.g., "Grade 7 Fees 2024/2025")</td></tr>
          <tr><td><code>academic_year_id</code></td><td>Reference</td><td>Linked academic year</td></tr>
          <tr><td><code>description</code></td><td>Text</td><td>Brief description of the fee structure</td></tr>
          <tr><td><code>is_active</code></td><td>Boolean</td><td>Whether the structure is currently in use</td></tr>
          <tr><td><code>items</code></td><td>Array</td><td>List of fee items with name and amount</td></tr>
        </tbody>
      </table>

      <h2 id="invoice-fields">Invoice fields</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>invoice_number</code></td><td>Text</td><td>Auto-generated unique invoice number</td></tr>
          <tr><td><code>student_id</code></td><td>Reference</td><td>Student this invoice is for</td></tr>
          <tr><td><code>fee_structure_id</code></td><td>Reference</td><td>The fee structure used to generate this invoice</td></tr>
          <tr><td><code>total_amount</code></td><td>Number</td><td>Total amount due</td></tr>
          <tr><td><code>amount_paid</code></td><td>Number</td><td>Amount already paid</td></tr>
          <tr><td><code>balance</code></td><td>Number</td><td>Remaining balance (auto-calculated)</td></tr>
          <tr><td><code>due_date</code></td><td>Date</td><td>Payment deadline</td></tr>
          <tr><td><code>status</code></td><td>Enum</td><td>pending, partial, paid, overdue</td></tr>
        </tbody>
      </table>

      <h2 id="payment-fields">Payment fields</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>payment_number</code></td><td>Text</td><td>Auto-generated payment reference</td></tr>
          <tr><td><code>invoice_id</code></td><td>Reference</td><td>Linked invoice</td></tr>
          <tr><td><code>amount</code></td><td>Number</td><td>Amount paid</td></tr>
          <tr><td><code>payment_method</code></td><td>Enum</td><td>cash, bank_transfer, mobile_money, check</td></tr>
          <tr><td><code>reference_number</code></td><td>Text</td><td>External reference (bank reference, check number)</td></tr>
          <tr><td><code>payment_date</code></td><td>Date</td><td>Date the payment was received</td></tr>
          <tr><td><code>notes</code></td><td>Text</td><td>Additional notes about the payment</td></tr>
        </tbody>
      </table>

      <h2 id="receipt-fields">Receipt fields</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>receipt_number</code></td><td>Text</td><td>Auto-generated receipt number</td></tr>
          <tr><td><code>payment_id</code></td><td>Reference</td><td>Linked payment</td></tr>
          <tr><td><code>school_name</code></td><td>Text</td><td>School name (from school profile)</td></tr>
          <tr><td><code>school_logo</code></td><td>URL</td><td>School logo (from school profile)</td></tr>
          <tr><td><code>student_name</code></td><td>Text</td><td>Student name</td></tr>
          <tr><td><code>student_id</code></td><td>Text</td><td>Student ID</td></tr>
          <tr><td><code>amount_paid</code></td><td>Number</td><td>Amount paid in this transaction</td></tr>
          <tr><td><code>remaining_balance</code></td><td>Number</td><td>Outstanding balance after this payment</td></tr>
        </tbody>
      </table>
    `,
  },

  // ─────────────────────────────────────────────
  // PLATFORM
  // ─────────────────────────────────────────────
  "platform/security": {
    title: "Security",
    description: "Security overview and best practices",
    section: "PLATFORM",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "authentication", title: "Authentication", level: 2 },
      { id: "data-protection", title: "Data protection", level: 2 },
      { id: "best-practices", title: "Best practices", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal implements industry-standard security measures to protect your school's data. This page outlines the security features and best practices for maintaining a secure environment.</p>

      <h2 id="authentication">Authentication</h2>
      <ul>
        <li><strong>Email/password authentication:</strong> Secure password-based login with bcrypt hashing</li>
        <li><strong>Google OAuth:</strong> Sign in with your Google account for convenience</li>
        <li><strong>Turnstile captcha:</strong> Protection against brute force attacks</li>
        <li><strong>Session management:</strong> Secure session tokens with automatic expiration</li>
        <li><strong>Two-factor authentication:</strong> Optional 2FA via authenticator apps</li>
      </ul>

      <h2 id="data-protection">Data protection</h2>
      <ul>
        <li><strong>Encryption in transit:</strong> All data is transmitted over HTTPS/TLS</li>
        <li><strong>Encryption at rest:</strong> Database encryption via Supabase</li>
        <li><strong>Row-Level Security:</strong> Database-level access control ensures users can only see their permitted data</li>
        <li><strong>Regular backups:</strong> Automated daily backups with point-in-time recovery</li>
      </ul>

      <h2 id="best-practices">Best practices</h2>
      <ul>
        <li>Use strong, unique passwords (at least 12 characters)</li>
        <li>Enable two-factor authentication for all admin accounts</li>
        <li>Regularly review active sessions and revoke unused ones</li>
        <li>Keep staff accounts up to date — deactivate accounts for departed staff promptly</li>
        <li>Limit super admin access to only those who need it</li>
      </ul>
    `,
  },

  "platform/privacy": {
    title: "Privacy",
    description: "Data privacy and protection policies",
    section: "PLATFORM",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "data-collection", title: "Data collection", level: 2 },
      { id: "data-usage", title: "Data usage", level: 2 },
      { id: "data-retention", title: "Data retention", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal is committed to protecting the privacy of student, staff, and parent data. We comply with applicable data protection regulations and implement strict data governance policies.</p>

      <h2 id="data-collection">Data collection</h2>
      <p>Decimal collects only the data necessary for school management functionality: student personal and academic information, staff employment details, financial transaction records, and usage analytics for platform improvement.</p>

      <h2 id="data-usage">Data usage</h2>
      <p>Data is used exclusively for the purposes of school management: student tracking, academic reporting, financial management, communication, and platform analytics. Data is never sold to third parties or used for advertising purposes.</p>

      <h2 id="data-retention">Data retention</h2>
      <p>School data is retained as long as the school maintains an active account. Historical academic data is preserved in read-only format. Upon account deletion, all data is permanently removed within 30 days.</p>
    `,
  },

  "platform/offline-sync": {
    title: "Offline & sync",
    description: "Offline mode and data synchronization details",
    section: "PLATFORM",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "offline-capabilities", title: "Offline capabilities", level: 2 },
      { id: "sync-mechanism", title: "Sync mechanism", level: 2 },
      { id: "troubleshooting", title: "Troubleshooting sync issues", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>Decimal's offline-first architecture ensures schools can continue operating even without reliable internet connectivity. Data is stored locally and synchronized when connectivity is restored.</p>

      <h2 id="offline-capabilities">Offline capabilities</h2>
      <ul>
        <li><strong>Take attendance:</strong> Record student attendance offline; syncs when online</li>
        <li><strong>Enter grades:</strong> Enter marks and grades offline; syncs when online</li>
        <li><strong>View records:</strong> Access cached student, staff, and timetable data</li>
        <li><strong>Record payments:</strong> Log payments offline; syncs when online</li>
      </ul>
      <p>Features that require server access (report card generation, sending emails, real-time notifications) are queued and processed when connectivity is restored.</p>

      <h2 id="sync-mechanism">Sync mechanism</h2>
      <p>The sync engine uses IndexedDB to store pending changes locally. When connectivity is detected, the engine processes the queue in order, uploading changes to the server. The sync indicator in the navigation bar shows the number of pending items.</p>

      <h2 id="troubleshooting">Troubleshooting sync issues</h2>
      <ul>
        <li><strong>Data not appearing on other devices:</strong> Check the sync indicator — pending items may need manual sync</li>
        <li><strong>Conflict warnings:</strong> Two devices modified the same data while offline; resolve manually</li>
        <li><strong>Sync stuck:</strong> Check internet connection and try forcing a manual sync</li>
      </ul>
    `,
  },

  "platform/requirements": {
    title: "System requirements",
    description: "Browser and device support information",
    section: "PLATFORM",
    headings: [
      { id: "browsers", title: "Supported browsers", level: 2 },
      { id: "mobile", title: "Mobile devices", level: 2 },
      { id: "desktop", title: "Desktop applications", level: 2 },
      { id: "internet", title: "Internet requirements", level: 2 },
    ],
    content: `
      <h2 id="browsers">Supported browsers</h2>
      <p>Decimal works best on modern browsers. Supported browsers include:</p>
      <ul>
        <li><strong>Chrome:</strong> Version 90 or later (recommended)</li>
        <li><strong>Firefox:</strong> Version 88 or later</li>
        <li><strong>Safari:</strong> Version 14 or later</li>
        <li><strong>Edge:</strong> Version 90 or later</li>
      </ul>

      <h2 id="mobile">Mobile devices</h2>
      <ul>
        <li><strong>Android:</strong> Android 8.0 or later (via Capacitor app or mobile browser)</li>
        <li><strong>iOS:</strong> Safari on iOS 14 or later (progressive web app)</li>
      </ul>

      <h2 id="desktop">Desktop applications</h2>
      <ul>
        <li><strong>Windows:</strong> Windows 10 or later (via Tauri desktop app)</li>
        <li><strong>Linux:</strong> Ubuntu 20.04 or later (via Tauri desktop app)</li>
      </ul>

      <h2 id="internet">Internet requirements</h2>
      <p>Decimal works offline, but initial setup and certain features require internet:</p>
      <ul>
        <li><strong>Minimum:</strong> Any internet connection for initial login and data sync</li>
        <li><strong>Recommended:</strong> Broadband connection for optimal performance</li>
        <li><strong>Offline:</strong> Core features work without internet; data syncs when reconnected</li>
      </ul>
    `,
  },

  "platform/changelog": {
    title: "Changelog",
    description: "Release history and version notes",
    section: "PLATFORM",
    headings: [
      { id: "v0-1-0", title: "Version 0.1.0", level: 2 },
      { id: "features", title: "Features", level: 2 },
    ],
    content: `
      <h2 id="v0-1-0">Version 0.1.0</h2>
      <p>Initial release of the Decimal school management platform.</p>

      <h2 id="features">Features</h2>
      <ul>
        <li>Student management with full profile support</li>
        <li>Staff management with role-based access control</li>
        <li>Attendance tracking with offline support</li>
        <li>Academic management (classes, subjects, grading)</li>
        <li>Examination management with mark entry and grade computation</li>
        <li>Timetable builder with conflict detection</li>
        <li>Admissions pipeline for enrollment management</li>
        <li>Finance module with fee structures, invoicing, and payments</li>
        <li>Communication system with announcements and messaging</li>
        <li>Report cards and analytics dashboard</li>
        <li>Offline-first architecture with background sync</li>
        <li>Android app via Capacitor</li>
        <li>Desktop app via Tauri</li>
        <li>Multi-school support for super administrators</li>
      </ul>
    `,
  },

  "platform/known-issues": {
    title: "Known issues",
    description: "Current limitations and known bugs",
    section: "PLATFORM",
    headings: [
      { id: "current-limitations", title: "Current limitations", level: 2 },
      { id: "known-bugs", title: "Known bugs", level: 2 },
    ],
    content: `
      <h2 id="current-limitations">Current limitations</h2>
      <ul>
        <li>Report card generation requires an active internet connection</li>
        <li>Email notifications are queued when offline and sent in batch when reconnected</li>
        <li>CSV import supports a maximum of 500 students per upload</li>
        <li>Timetable builder does not yet support room assignment optimization</li>
        <li>Mobile app does not support all offline features</li>
      </ul>

      <h2 id="known-bugs">Known bugs</h2>
      <ul>
        <li>Attendance reports may show incorrect totals when switching between terms</li>
        <li>Fee structure copy does not preserve discount configurations</li>
        <li>PDF export of report cards may cut off long teacher comments</li>
      </ul>
      <p>For the latest status on known issues, visit the Decimal support page or contact the development team.</p>
    `,
  },

  // ─────────────────────────────────────────────
  // SUPPORT
  // ─────────────────────────────────────────────
  "support/faq": {
    title: "FAQ",
    description: "Frequently asked questions",
    section: "SUPPORT",
    headings: [
      { id: "general", title: "General questions", level: 2 },
      { id: "account", title: "Account & login", level: 2 },
      { id: "data", title: "Data & privacy", level: 2 },
      { id: "technical", title: "Technical questions", level: 2 },
    ],
    content: `
      <h2 id="general">General questions</h2>
      <p><strong>What is Decimal?</strong></p>
      <p>Decimal is a cloud-based school management platform that helps schools manage students, staff, academics, finances, and communications in one place.</p>

      <p><strong>Is Decimal free to use?</strong></p>
      <p>Decimal offers a free tier for small schools. Contact us for pricing on larger deployments and enterprise features.</p>

      <p><strong>Can I use Decimal for multiple schools?</strong></p>
      <p>Yes. Super administrators can manage multiple schools from a single account. Each school's data is isolated.</p>

      <h2 id="account">Account & login</h2>
      <p><strong>How do I reset my password?</strong></p>
      <p>Click "Forgot Password" on the login page and follow the instructions sent to your email.</p>

      <p><strong>Can I change my email address?</strong></p>
      <p>Yes. Go to Settings → Profile and update your email address. You will need to verify the new email.</p>

      <p><strong>How do I enable two-factor authentication?</strong></p>
      <p>Go to Settings → Security and follow the 2FA setup wizard. You will need an authenticator app like Google Authenticator.</p>

      <h2 id="data">Data & privacy</h2>
      <p><strong>Where is my data stored?</strong></p>
      <p>Data is stored in Supabase's cloud infrastructure with encryption at rest and in transit.</p>

      <p><strong>Can I export my data?</strong></p>
      <p>Yes. Most modules support CSV and PDF export. Contact support for full data export requests.</p>

      <p><strong>What happens if I cancel my account?</strong></p>
      <p>You can export all your data before cancellation. After cancellation, data is retained for 30 days then permanently deleted.</p>

      <h2 id="technical">Technical questions</h2>
      <p><strong>Does Decimal work offline?</strong></p>
      <p>Yes. Core features like attendance, grade entry, and student record viewing work offline. Data syncs automatically when connectivity is restored.</p>

      <p><strong>What browsers are supported?</strong></p>
      <p>Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+ are supported.</p>

      <p><strong>Is there a mobile app?</strong></p>
      <p>Yes. Decimal is available as an Android app via the Google Play Store. iOS users can use the web app via Safari.</p>
    `,
  },

  "support/troubleshooting": {
    title: "Troubleshooting",
    description: "Common problems and their fixes",
    section: "SUPPORT",
    headings: [
      { id: "login-issues", title: "Login issues", level: 2 },
      { id: "sync-issues", title: "Sync issues", level: 2 },
      { id: "performance", title: "Performance issues", level: 2 },
      { id: "data-issues", title: "Data issues", level: 2 },
    ],
    content: `
      <h2 id="login-issues">Login issues</h2>
      <p><strong>Cannot log in with email/password:</strong></p>
      <ul>
        <li>Verify you are using the correct email address</li>
        <li>Check for typos in your password</li>
        <li>Try resetting your password via the "Forgot Password" link</li>
        <li>Clear your browser cache and cookies</li>
      </ul>

      <p><strong>Google login not working:</strong></p>
      <ul>
        <li>Ensure you are using the correct Google account</li>
        <li>Check if third-party cookies are enabled in your browser</li>
        <li>Try signing in with email/password instead</li>
      </ul>

      <h2 id="sync-issues">Sync issues</h2>
      <p><strong>Data not syncing:</strong></p>
      <ul>
        <li>Check your internet connection</li>
        <li>Click the sync icon to force a manual sync</li>
        <li>Check the sync indicator for pending items</li>
        <li>If sync is stuck, try logging out and back in</li>
      </ul>

      <p><strong>Conflict warnings:</strong></p>
      <ul>
        <li>This occurs when the same data was modified on two devices while offline</li>
        <li>Review the conflicting entries and choose which version to keep</li>
      </ul>

      <h2 id="performance">Performance issues</h2>
      <ul>
        <li><strong>Slow loading:</strong> Clear browser cache, close unused tabs, check internet speed</li>
        <li><strong>Page not loading:</strong> Try refreshing the page or using a different browser</li>
        <li><strong>Large datasets:</strong> Use filters and pagination to reduce load times</li>
      </ul>

      <h2 id="data-issues">Data issues</h2>
      <ul>
        <li><strong>Missing students:</strong> Check class filters and search parameters</li>
        <li><strong>Incorrect grades:</strong> Verify assessment weights and grade boundaries in Settings</li>
        <li><strong>Fee calculation errors:</strong> Check fee structure assignments and discount configurations</li>
      </ul>
    `,
  },

  "support/contact": {
    title: "Contact support",
    description: "Get help from the Decimal team",
    section: "SUPPORT",
    headings: [
      { id: "overview", title: "Overview", level: 2 },
      { id: "support-channels", title: "Support channels", level: 2 },
      { id: "response-times", title: "Response times", level: 2 },
      { id: "bug-reports", title: "Bug reports", level: 2 },
    ],
    content: `
      <h2 id="overview">Overview</h2>
      <p>The Decimal support team is here to help you get the most out of the platform. Whether you have a question, need assistance with a feature, or want to report a bug, we're ready to assist.</p>

      <h2 id="support-channels">Support channels</h2>
      <ul>
        <li><strong>Email:</strong> support@decimal-app.vercel.app — For general inquiries and support requests</li>
        <li><strong>In-app help:</strong> Click the help icon in the sidebar for contextual assistance</li>
        <li><strong>Documentation:</strong> Browse these docs for guides, tutorials, and reference material</li>
        <li><strong>GitHub:</strong> Report bugs and feature requests on our GitHub repository</li>
      </ul>

      <h2 id="response-times">Response times</h2>
      <table>
        <thead>
          <tr><th>Priority</th><th>Description</th><th>Response time</th></tr>
        </thead>
        <tbody>
          <tr><td>Critical</td><td>System outage or data loss</td><td>Within 4 hours</td></tr>
          <tr><td>High</td><td>Feature not working, blocking operations</td><td>Within 24 hours</td></tr>
          <tr><td>Medium</td><td>Non-critical bug or question</td><td>Within 48 hours</td></tr>
          <tr><td>Low</td><td>Feature request or general inquiry</td><td>Within 72 hours</td></tr>
        </tbody>
      </table>

      <h2 id="bug-reports">Bug reports</h2>
      <p>When reporting a bug, please include:</p>
      <ul>
        <li>A clear description of the issue</li>
        <li>Steps to reproduce the problem</li>
        <li>Expected vs. actual behavior</li>
        <li>Browser and device information</li>
        <li>Screenshots or screen recordings if applicable</li>
      </ul>
    `,
  },
};

export function getDocContent(slug: string): DocPage | undefined {
  return docsContent[slug];
}

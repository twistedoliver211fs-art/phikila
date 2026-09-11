export interface DocSection {
  title: string;
  items: DocItem[];
}

export interface DocItem {
  title: string;
  slug: string;
  description?: string;
}

export interface DocPage {
  title: string;
  description: string;
  section: string;
  headings: { id: string; title: string; level: number }[];
  content: string;
}

export const docsNavigation: DocSection[] = [
  {
    title: "GET STARTED",
    items: [
      { title: "Overview", slug: "getting-started/overview", description: "Introduction to Decimal" },
      { title: "Quickstart", slug: "getting-started/quickstart", description: "Set up your school in minutes" },
      { title: "Create your school", slug: "getting-started/create-school", description: "Register and configure your school" },
      { title: "Set up your account", slug: "getting-started/setup-account", description: "Configure your admin account" },
      { title: "Invite staff", slug: "getting-started/invite-staff", description: "Add teachers and administrators" },
      { title: "First-day checklist", slug: "getting-started/first-day", description: "Everything to do on day one" },
    ],
  },
  {
    title: "CORE FEATURES",
    items: [
      { title: "Students", slug: "core/students", description: "Manage student records" },
      { title: "Staff", slug: "core/staff", description: "Manage teacher and staff records" },
      { title: "Attendance", slug: "core/attendance", description: "Track daily attendance" },
      { title: "Academics", slug: "core/academics", description: "Classes, subjects, and grading" },
      { title: "Examinations", slug: "core/examinations", description: "Exam management and results" },
      { title: "Timetable", slug: "core/timetable", description: "Build and manage timetables" },
      { title: "Admissions", slug: "core/admissions", description: "Enrollment and applications" },
      { title: "Finance", slug: "core/finance", description: "Fee structures and payments" },
      { title: "Communication", slug: "core/communication", description: "Messages and announcements" },
      { title: "Reports", slug: "core/reports", description: "Analytics and report cards" },
    ],
  },
  {
    title: "ROLES",
    items: [
      { title: "Super Admin", slug: "roles/super-admin", description: "Platform administration" },
      { title: "Principal", slug: "roles/principal", description: "School operations management" },
      { title: "Teacher", slug: "roles/teacher", description: "Classroom management" },
      { title: "Finance", slug: "roles/finance", description: "Fee and payment management" },
      { title: "Secretary", slug: "roles/secretary", description: "Daily operations" },
      { title: "Admissions Officer", slug: "roles/admissions", description: "Enrollment management" },
      { title: "Parent", slug: "roles/parent", description: "Child progress tracking" },
    ],
  },
  {
    title: "GUIDES",
    items: [
      { title: "School setup", slug: "guides/school-setup", description: "Complete school configuration" },
      { title: "Import students", slug: "guides/import-students", description: "Bulk student enrollment" },
      { title: "Academic years", slug: "guides/academic-years", description: "Configure terms and years" },
      { title: "Grading system", slug: "guides/grading", description: "Set up grading scales" },
      { title: "Create a timetable", slug: "guides/create-timetable", description: "Build your class schedule" },
      { title: "Manage school fees", slug: "guides/manage-fees", description: "Fee structures and billing" },
      { title: "Generate reports", slug: "guides/generate-reports", description: "Report cards and analytics" },
      { title: "Manage staff", slug: "guides/manage-staff", description: "Staff onboarding and roles" },
    ],
  },
  {
    title: "CONCEPTS",
    items: [
      { title: "Roles & permissions", slug: "concepts/roles-permissions", description: "Access control model" },
      { title: "Academic years", slug: "concepts/academic-years", description: "How academic periods work" },
      { title: "Grading", slug: "concepts/grading", description: "Grading systems explained" },
      { title: "Attendance", slug: "concepts/attendance", description: "Attendance tracking model" },
      { title: "Fee structures", slug: "concepts/fees", description: "How fees and billing work" },
      { title: "Timetable engine", slug: "concepts/timetable", description: "Scheduling algorithm" },
      { title: "Offline-first", slug: "concepts/offline", description: "Offline mode and sync" },
    ],
  },
  {
    title: "REFERENCE",
    items: [
      { title: "Settings", slug: "reference/settings", description: "School configuration options" },
      { title: "Permissions", slug: "reference/permissions", description: "Role permission matrix" },
      { title: "Student fields", slug: "reference/student-fields", description: "Student record fields" },
      { title: "Attendance statuses", slug: "reference/attendance-statuses", description: "Attendance state values" },
      { title: "Grading systems", slug: "reference/grading-systems", description: "Grading scale reference" },
      { title: "Fee fields", slug: "reference/fee-fields", description: "Fee structure fields" },
    ],
  },
  {
    title: "PLATFORM",
    items: [
      { title: "Security", slug: "platform/security", description: "Security overview" },
      { title: "Privacy", slug: "platform/privacy", description: "Data privacy and protection" },
      { title: "Offline & sync", slug: "platform/offline-sync", description: "Offline mode and synchronization" },
      { title: "System requirements", slug: "platform/requirements", description: "Browser and device support" },
      { title: "Changelog", slug: "platform/changelog", description: "Release history" },
      { title: "Known issues", slug: "platform/known-issues", description: "Current limitations" },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { title: "FAQ", slug: "support/faq", description: "Frequently asked questions" },
      { title: "Troubleshooting", slug: "support/troubleshooting", description: "Common problems and fixes" },
      { title: "Contact support", slug: "support/contact", description: "Get help from the team" },
    ],
  },
];

export function getAllDocSlugs(): string[][] {
  const slugs: string[][] = [];
  for (const section of docsNavigation) {
    for (const item of section.items) {
      slugs.push(item.slug.split("/"));
    }
  }
  return slugs;
}

export function getDocBySlug(slug: string): DocItem | undefined {
  for (const section of docsNavigation) {
    for (const item of section.items) {
      if (item.slug === slug) return item;
    }
  }
  return undefined;
}

export function getSectionBySlug(slug: string): DocSection | undefined {
  const sectionName = slug.split("/")[0];
  const sectionMap: Record<string, string> = {
    "getting-started": "GET STARTED",
    core: "CORE FEATURES",
    roles: "ROLES",
    guides: "GUIDES",
    concepts: "CONCEPTS",
    reference: "REFERENCE",
    platform: "PLATFORM",
    support: "SUPPORT",
  };
  const title = sectionMap[sectionName];
  return docsNavigation.find((s) => s.title === title);
}

export function getAdjacentDocs(slug: string): { prev: DocItem | null; next: DocItem | null } {
  const allItems: DocItem[] = docsNavigation.flatMap((s) => s.items);
  const idx = allItems.findIndex((i) => i.slug === slug);
  return {
    prev: idx > 0 ? allItems[idx - 1] : null,
    next: idx < allItems.length - 1 ? allItems[idx + 1] : null,
  };
}

export function searchDocs(query: string): DocItem[] {
  const q = query.toLowerCase();
  const results: DocItem[] = [];
  for (const section of docsNavigation) {
    for (const item of section.items) {
      const searchable = `${item.title} ${item.description || ""} ${item.slug}`.toLowerCase();
      if (searchable.includes(q)) {
        results.push(item);
      }
    }
  }
  return results;
}

import {
  Shield,
  Wifi,
  WifiOff,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const offlineCapabilities = [
  "Attendance",
  "Timetable",
  "Student Records",
  "Academic Records",
];

export function Roles() {
  return (
    <>
      {/* Offline Section */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Offline-First
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Keep working when the connection doesn&apos;t
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Essential workflows continue offline. Changes sync automatically
              when you&apos;re back online.
            </p>
          </div>

          {/* Flow Diagram */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { icon: Wifi, label: "Online", color: "text-green-600 bg-green-50 border-green-200" },
              { icon: null, label: "→", color: "text-muted-foreground bg-transparent border-transparent" },
              { icon: null, label: "Work", color: "text-primary bg-primary/5 border-primary/20" },
              { icon: null, label: "→", color: "text-muted-foreground bg-transparent border-transparent" },
              { icon: WifiOff, label: "Offline", color: "text-amber-600 bg-amber-50 border-amber-200" },
              { icon: null, label: "→", color: "text-muted-foreground bg-transparent border-transparent" },
              { icon: RefreshCw, label: "Reconnect", color: "text-blue-600 bg-blue-50 border-blue-200" },
              { icon: null, label: "→", color: "text-muted-foreground bg-transparent border-transparent" },
              { icon: CheckCircle, label: "Synced", color: "text-green-600 bg-green-50 border-green-200" },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${step.color}`}>
                {step.icon && <step.icon className="h-4 w-4" />}
                <span>{step.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {offlineCapabilities.map((cap) => (
              <span
                key={cap}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Role-Based
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              One platform. Built around every role.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each role gets a purpose-built experience — the right information,
              the right actions, the right level of detail.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                role: "Super Admin",
                desc: "Platform-wide monitoring, school management, system health",
                color: "from-red-500/10 to-red-500/5 border-red-200",
                icon: Shield,
              },
              {
                role: "Principal",
                desc: "School operations, staff oversight, decision-making",
                color: "from-primary/10 to-primary/5 border-primary/20",
                icon: null,
              },
              {
                role: "Teacher",
                desc: "Daily teaching, attendance, academics, communication",
                color: "from-blue-500/10 to-blue-500/5 border-blue-200",
                icon: null,
              },
              {
                role: "Staff",
                desc: "Finance, admissions, office administration",
                color: "from-amber-500/10 to-amber-500/5 border-amber-200",
                icon: null,
              },
              {
                role: "Parent",
                desc: "Child overview, fees, academics, communication",
                color: "from-green-500/10 to-green-500/5 border-green-200",
                icon: null,
              },
            ].map((item) => (
              <div
                key={item.role}
                className={`rounded-xl border bg-gradient-to-b p-5 ${item.color}`}
              >
                <h3 className="text-base font-semibold text-foreground">
                  {item.role}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communication Section */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Communication
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Keep everyone connected
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                from: "Principal",
                to: "Teachers",
                desc: "Staff announcements, schedule changes, direct messages",
              },
              {
                from: "Principal",
                to: "Parents",
                desc: "School updates, fee reminders, academic reports",
              },
              {
                from: "Super Admin",
                to: "Schools",
                desc: "Platform updates, policy changes, support",
              },
            ].map((channel) => (
              <div
                key={`${channel.from}-${channel.to}`}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <span>{channel.from}</span>
                  <span className="text-muted-foreground">↔</span>
                  <span>{channel.to}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {channel.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Built for responsible school management
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Role-based access, audit trails, secure authentication, and safe
            synchronization — so your school data stays protected.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {[
              "Role-based access",
              "Audit trails",
              "Secure authentication",
              "Safe sync",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground"
              >
                <CheckCircle className="h-4 w-4 text-success" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

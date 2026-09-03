import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function NoAccessPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          No School Access
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Your account doesn&apos;t have access to any school yet. Contact your
          school administrator to get invited, or register a new school.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
          <Link href="/login">
            <Button>Sign In Again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

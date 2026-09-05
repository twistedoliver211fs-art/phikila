import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX, School } from "lucide-react";

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
          Your account doesn&apos;t have access to any school yet. Register your
          own school or contact your school administrator to get invited.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register/school">
            <Button className="gap-2">
              <School className="h-4 w-4" />
              Register Your School
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Sign In Again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

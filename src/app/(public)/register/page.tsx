import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { School, LogIn } from "lucide-react";

export default function RegisterPage() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpeg" alt="Phikila" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-white">Phikila</span>
          </Link>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white">Get Started with Phikila</h1>
          <p className="mt-2 text-sm text-white/70">
            Choose how you&apos;d like to proceed.
          </p>

          <div className="mt-8 space-y-4">
            <Link href="/register/school">
              <Button className="w-full h-12 text-base gap-2">
                <School className="h-5 w-5" />
                Register a New School
              </Button>
            </Link>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-2 text-white/50">or</span>
              </div>
            </div>

            <Link href="/login">
              <Button variant="outline" className="w-full h-12 text-base gap-2 border-white/20 text-white hover:bg-white/10">
                <LogIn className="h-5 w-5" />
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-white/60">
          <Link href="/" className="hover:underline">&larr; Back to home</Link>
        </p>
      </div>
    </section>
  );
}

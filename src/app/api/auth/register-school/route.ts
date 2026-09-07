import { handleRegisterSchool } from "@/lib/api/register-school";

export async function POST(request: Request) {
  return handleRegisterSchool(request);
}

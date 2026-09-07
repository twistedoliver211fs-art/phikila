import { handleAttendanceSync } from "@/lib/api/sync-handlers";

export async function POST(request: Request) {
  return handleAttendanceSync(request);
}

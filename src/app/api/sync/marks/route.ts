import { handleMarksSync } from "@/lib/api/sync-handlers";

export async function POST(request: Request) {
  return handleMarksSync(request);
}

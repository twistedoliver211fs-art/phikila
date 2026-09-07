import { handleUpdateSchool } from "@/lib/api/admin-handlers";

export async function PATCH(request: Request) {
  return handleUpdateSchool(request);
}

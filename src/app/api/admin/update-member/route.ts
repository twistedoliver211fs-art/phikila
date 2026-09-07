import { handleUpdateMember } from "@/lib/api/admin-handlers";

export async function PATCH(request: Request) {
  return handleUpdateMember(request);
}

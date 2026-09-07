import { handleRemoveMember } from "@/lib/api/admin-handlers";

export async function DELETE(request: Request) {
  return handleRemoveMember(request);
}

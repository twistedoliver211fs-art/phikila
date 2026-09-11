import { createAdminClient } from "@/lib/supabase/server-admin";

export interface Message {
  id: string;
  schoolId: string;
  senderId: string | null;
  recipientId: string | null;
  conversationId: string | null;
  subject: string | null;
  content: string;
  messageType: string;
  attachments: unknown[];
  readAt: string | null;
  sentAt: string;
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    senderId: row.sender_id as string | null,
    recipientId: row.recipient_id as string | null,
    conversationId: row.conversation_id as string | null,
    subject: row.subject as string | null,
    content: row.content as string,
    messageType: (row.message_type as string) ?? "direct",
    attachments: (row.attachments as unknown[]) ?? [],
    readAt: row.read_at as string | null,
    sentAt: row.sent_at as string,
  };
}

export async function getMessages(
  schoolId: string,
  userId: string
): Promise<Message[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("messages")
    .select("*")
    .eq("school_id", schoolId)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("sent_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

export async function getUnreadCount(
  schoolId: string,
  userId: string
): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) throw error;
  return count ?? 0;
}

export async function markAsRead(
  messageId: string,
  userId: string
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) throw error;
}

export async function sendMessage(params: {
  schoolId: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  content: string;
  conversationId?: string;
}): Promise<Message> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("messages")
    .insert({
      school_id: params.schoolId,
      sender_id: params.senderId,
      recipient_id: params.recipientId,
      subject: params.subject ?? null,
      content: params.content,
      conversation_id: params.conversationId ?? null,
      message_type: "direct",
    })
    .select()
    .single();

  if (error) throw error;
  return mapMessage(data);
}

export interface Conversation {
  id: string;
  schoolId: string;
  title: string | null;
  createdBy: string | null;
  createdAt: string;
}

function mapConversation(row: Record<string, unknown>): Conversation {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    title: row.title as string | null,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
  };
}

export async function getConversations(
  schoolId: string,
  userId: string
): Promise<Conversation[]> {
  const admin = createAdminClient();

  const { data: participantRows, error: partError } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (partError) throw partError;
  const convIds = (participantRows ?? []).map((r) => r.conversation_id);
  if (convIds.length === 0) return [];

  const { data, error } = await admin
    .from("conversations")
    .select("*")
    .eq("school_id", schoolId)
    .in("id", convIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapConversation);
}

export async function createConversation(params: {
  schoolId: string;
  createdBy: string;
  title?: string;
  participantIds: string[];
}): Promise<Conversation> {
  const admin = createAdminClient();

  const { data: conv, error: convError } = await admin
    .from("conversations")
    .insert({
      school_id: params.schoolId,
      created_by: params.createdBy,
      title: params.title ?? null,
    })
    .select()
    .single();

  if (convError) throw convError;

  const uniqueIds = new Set(params.participantIds);
  uniqueIds.delete(params.createdBy);

  const participants = [
    { conversation_id: conv.id, user_id: params.createdBy },
    ...[...uniqueIds].map((id) => ({
      conversation_id: conv.id,
      user_id: id,
    })),
  ];

  const { error: partError } = await admin
    .from("conversation_participants")
    .insert(participants);

  if (partError) throw partError;

  return mapConversation(conv);
}

export async function getConversationMessages(
  conversationId: string,
  userId: string
): Promise<Message[]> {
  const admin = createAdminClient();

  const { data: participant } = await admin
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .single();

  if (!participant) {
    throw new Error("You are not a participant in this conversation");
  }

  const { data, error } = await admin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

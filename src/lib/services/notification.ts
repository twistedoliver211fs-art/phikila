import { createAdminClient } from "@/lib/supabase/server-admin";

export type NotificationChannel = "in_app" | "email" | "sms";
export type NotificationEventType =
  | "student.enrolled"
  | "student.left"
  | "invoice.created"
  | "invoice.paid"
  | "payment.received"
  | "report.card.ready"
  | "announcement.new"
  | "message.received"
  | "exam.results"
  | "attendance.alert"
  | "fee.reminder"
  | "staff.added"
  | "staff.removed"
  | "school.created"
  | "school.updated"
  | "announcement.school";

export interface NotificationPreference {
  id: string;
  userId: string;
  schoolId: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  isEnabled: boolean;
}

function mapPreference(row: Record<string, unknown>): NotificationPreference {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    schoolId: row.school_id as string,
    channel: row.channel as NotificationChannel,
    eventType: row.event_type as NotificationEventType,
    isEnabled: row.is_enabled as boolean,
  };
}

export async function getPreferences(
  userId: string,
  schoolId?: string
): Promise<NotificationPreference[]> {
  const admin = createAdminClient();
  let query = admin
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId);

  if (schoolId) {
    query = query.eq("school_id", schoolId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapPreference);
}

export async function updatePreference(params: {
  userId: string;
  schoolId: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  isEnabled: boolean;
}): Promise<NotificationPreference> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("notification_preferences")
    .upsert(
      {
        user_id: params.userId,
        school_id: params.schoolId,
        channel: params.channel,
        event_type: params.eventType,
        is_enabled: params.isEnabled,
      },
      { onConflict: "user_id,school_id,channel,event_type" }
    )
    .select()
    .single();

  if (error) throw error;
  return mapPreference(data);
}

export async function shouldNotify(params: {
  userId: string;
  schoolId: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
}): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notification_preferences")
    .select("is_enabled")
    .eq("user_id", params.userId)
    .eq("school_id", params.schoolId)
    .eq("channel", params.channel)
    .eq("event_type", params.eventType)
    .single();

  if (error || !data) return true;
  return data.is_enabled;
}

export async function getEnabledEventsForUser(
  userId: string,
  schoolId: string
): Promise<NotificationEventType[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notification_preferences")
    .select("event_type")
    .eq("user_id", userId)
    .eq("school_id", schoolId)
    .eq("channel", "in_app")
    .eq("is_enabled", true);

  if (error) throw error;
  return (data ?? []).map((r) => r.event_type as NotificationEventType);
}

export async function setDefaultPreferences(
  userId: string,
  schoolId: string
): Promise<void> {
  const admin = createAdminClient();
  const events: NotificationEventType[] = [
    "student.enrolled",
    "invoice.created",
    "payment.received",
    "report.card.ready",
    "announcement.new",
    "message.received",
    "exam.results",
    "attendance.alert",
    "fee.reminder",
  ];

  const channels: NotificationChannel[] = ["in_app", "email"];

  const rows = events.flatMap((event_type) =>
    channels.map((channel) => ({
      user_id: userId,
      school_id: schoolId,
      channel,
      event_type,
      is_enabled: true,
    }))
  );

  const { error } = await admin
    .from("notification_preferences")
    .upsert(rows, { onConflict: "user_id,school_id,channel,event_type" });

  if (error) throw error;
}

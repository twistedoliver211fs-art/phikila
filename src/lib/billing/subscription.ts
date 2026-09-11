/**
 * Subscription Service
 *
 * Manages school-level subscriptions. Each school has at most one active
 * subscription at a time.
 */

import { createAdminClient } from "@/lib/supabase/server-admin";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { getPlanBySlug, getPlanById } from "@/lib/billing/plans";
import { emitEvent } from "@/lib/services/events";
import { logAudit } from "@/lib/services/audit";
import type { Subscription, SubscriptionStatus } from "@/lib/billing/types";

function mapSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    planId: row.plan_id as string,
    status: row.status as SubscriptionStatus,
    provider: row.provider as string | null,
    providerCustomerId: row.provider_customer_id as string | null,
    providerSubscriptionId: row.provider_subscription_id as string | null,
    currentPeriodStart: row.current_period_start as string | null,
    currentPeriodEnd: row.current_period_end as string | null,
    cancelAtPeriodEnd: row.cancel_at_period_end as boolean,
    trialEnd: row.trial_end as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Get the current subscription for a school.
 */
export async function getSubscription(
  schoolId: string
): Promise<Subscription | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("subscriptions")
    .select("*")
    .eq("school_id", schoolId)
    .in("status", ["trialing", "active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return mapSubscription(data);
}

/**
 * Create a trial subscription for a new school.
 */
export async function createTrialSubscription(
  schoolId: string,
  planSlug: string,
  trialDays: number = 14
): Promise<Subscription> {
  const admin = createAdminClient();

  const plan = await getPlanBySlug(planSlug);
  if (!plan) {
    throw new NotFoundError(`Plan: ${planSlug}`);
  }

  const now = new Date();
  const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const { data, error } = await admin
    .from("subscriptions")
    .insert({
      school_id: schoolId,
      plan_id: plan.id,
      status: "trialing",
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
      trial_end: trialEnd.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("[Subscription] Error creating trial:", error);
    throw new Error("Failed to create trial subscription");
  }

  await emitEvent({
    type: "subscription.created",
    schoolId,
    resourceType: "subscription",
    resourceId: data.id,
    payload: { plan: planSlug, trial: true, trialDays },
  });

  await logAudit({
    schoolId,
    action: "subscription.created",
    resourceType: "subscription",
    resourceId: data.id,
    metadata: { plan: planSlug, trial: true },
  });

  return mapSubscription(data);
}

/**
 * Activate a subscription after successful payment.
 */
export async function activateSubscription(
  schoolId: string,
  providerSubscriptionId: string
): Promise<Subscription> {
  const admin = createAdminClient();

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { data, error } = await admin
    .from("subscriptions")
    .update({
      status: "active",
      provider_subscription_id: providerSubscriptionId,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    })
    .eq("school_id", schoolId)
    .in("status", ["trialing", "past_due"])
    .select()
    .single();

  if (error) {
    console.error("[Subscription] Error activating:", error);
    throw new Error("Failed to activate subscription");
  }

  if (!data) {
    throw new NotFoundError("Subscription not found or already active");
  }

  await emitEvent({
    type: "subscription.activated",
    schoolId,
    resourceType: "subscription",
    resourceId: data.id,
    payload: { providerSubscriptionId },
  });

  await logAudit({
    schoolId,
    action: "subscription.activated",
    resourceType: "subscription",
    resourceId: data.id,
    metadata: { providerSubscriptionId },
  });

  return mapSubscription(data);
}

/**
 * Cancel a subscription. If immediate is false, cancels at period end.
 */
export async function cancelSubscription(
  schoolId: string,
  immediate: boolean = false
): Promise<void> {
  const admin = createAdminClient();

  const subscription = await getSubscription(schoolId);
  if (!subscription) {
    throw new NotFoundError("Active subscription");
  }

  if (immediate) {
    const { error } = await admin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subscription.id);

    if (error) {
      console.error("[Subscription] Error cancelling:", error);
      throw new Error("Failed to cancel subscription");
    }
  } else {
    const { error } = await admin
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("id", subscription.id);

    if (error) {
      console.error("[Subscription] Error setting cancel at period end:", error);
      throw new Error("Failed to schedule cancellation");
    }
  }

  await emitEvent({
    type: "subscription.cancelled",
    schoolId,
    resourceType: "subscription",
    resourceId: subscription.id,
    payload: { immediate },
  });

  await logAudit({
    schoolId,
    action: "subscription.cancelled",
    resourceType: "subscription",
    resourceId: subscription.id,
    metadata: { immediate },
  });
}

/**
 * Upgrade a subscription to a higher plan.
 */
export async function upgradeSubscription(
  schoolId: string,
  newPlanSlug: string
): Promise<Subscription> {
  const admin = createAdminClient();

  const newPlan = await getPlanBySlug(newPlanSlug);
  if (!newPlan) {
    throw new NotFoundError(`Plan: ${newPlanSlug}`);
  }

  const subscription = await getSubscription(schoolId);
  if (!subscription) {
    throw new NotFoundError("Active subscription");
  }

  const currentPlan = await getPlanById(subscription.planId);
  if (currentPlan && newPlan.sortOrder <= currentPlan.sortOrder) {
    throw new ValidationError("New plan must be higher than current plan");
  }

  const { data, error } = await admin
    .from("subscriptions")
    .update({ plan_id: newPlan.id })
    .eq("id", subscription.id)
    .select()
    .single();

  if (error) {
    console.error("[Subscription] Error upgrading:", error);
    throw new Error("Failed to upgrade subscription");
  }

  await emitEvent({
    type: "subscription.upgraded",
    schoolId,
    resourceType: "subscription",
    resourceId: subscription.id,
    payload: { fromPlan: currentPlan?.slug, toPlan: newPlanSlug },
  });

  await logAudit({
    schoolId,
    action: "subscription.upgraded",
    resourceType: "subscription",
    resourceId: subscription.id,
    metadata: { fromPlan: currentPlan?.slug, toPlan: newPlanSlug },
  });

  return mapSubscription(data);
}

/**
 * Downgrade a subscription to a lower plan.
 * Caller must check usage limits before calling this.
 */
export async function downgradeSubscription(
  schoolId: string,
  newPlanSlug: string
): Promise<Subscription> {
  const admin = createAdminClient();

  const newPlan = await getPlanBySlug(newPlanSlug);
  if (!newPlan) {
    throw new NotFoundError(`Plan: ${newPlanSlug}`);
  }

  const subscription = await getSubscription(schoolId);
  if (!subscription) {
    throw new NotFoundError("Active subscription");
  }

  const currentPlan = await getPlanById(subscription.planId);
  if (currentPlan && newPlan.sortOrder >= currentPlan.sortOrder) {
    throw new ValidationError("New plan must be lower than current plan");
  }

  const { data, error } = await admin
    .from("subscriptions")
    .update({ plan_id: newPlan.id })
    .eq("id", subscription.id)
    .select()
    .single();

  if (error) {
    console.error("[Subscription] Error downgrading:", error);
    throw new Error("Failed to downgrade subscription");
  }

  await emitEvent({
    type: "subscription.downgraded",
    schoolId,
    resourceType: "subscription",
    resourceId: subscription.id,
    payload: { fromPlan: currentPlan?.slug, toPlan: newPlanSlug },
  });

  await logAudit({
    schoolId,
    action: "subscription.downgraded",
    resourceType: "subscription",
    resourceId: subscription.id,
    metadata: { fromPlan: currentPlan?.slug, toPlan: newPlanSlug },
  });

  return mapSubscription(data);
}

/**
 * Check and expire trials that have passed their end date.
 * Can be called from a cron job or on-demand.
 */
export async function processExpiredTrials(): Promise<number> {
  const admin = createAdminClient();

  const { data: expired, error } = await admin
    .from("subscriptions")
    .select("id, school_id")
    .eq("status", "trialing")
    .lt("trial_end", new Date().toISOString());

  if (error || !expired?.length) return 0;

  let count = 0;
  for (const sub of expired) {
    await admin
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("id", sub.id);

    await emitEvent({
      type: "subscription.expired",
      schoolId: sub.school_id,
      resourceType: "subscription",
      resourceId: sub.id,
    });

    await logAudit({
      schoolId: sub.school_id,
      action: "subscription.expired",
      resourceType: "subscription",
      resourceId: sub.id,
    });

    count++;
  }

  return count;
}

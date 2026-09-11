/**
 * Entitlements Service
 *
 * Determines what features and limits a school has access to
 * based on their current subscription plan.
 */

import { getSubscription } from "@/lib/billing/subscription";
import { getPlanById } from "@/lib/billing/plans";
import { FeatureNotIncludedError } from "@/lib/errors";
import type { Entitlements } from "@/lib/billing/types";

const DEFAULT_LIMITS = { students: 25, staff: 5 };

/**
 * Get the entitlements for a school based on its current subscription.
 */
export async function getEntitlements(schoolId: string): Promise<Entitlements> {
  const subscription = await getSubscription(schoolId);

  if (!subscription) {
    // No subscription = free tier with minimal limits
    return {
      features: {},
      limits: DEFAULT_LIMITS,
      isActive: false,
      isTrial: false,
      trialEnd: null,
    };
  }

  const plan = await getPlanById(subscription.planId);
  if (!plan) {
    return {
      features: {},
      limits: DEFAULT_LIMITS,
      isActive: false,
      isTrial: false,
      trialEnd: null,
    };
  }

  const isActive = ["active", "trialing", "past_due"].includes(
    subscription.status
  );
  const isTrial = subscription.status === "trialing";

  return {
    features: plan.features,
    limits: {
      students: plan.maxStudents,
      staff: plan.maxStaff,
    },
    isActive,
    isTrial,
    trialEnd: subscription.trialEnd,
  };
}

/**
 * Check if a specific feature is enabled for a school.
 */
export async function hasFeature(
  schoolId: string,
  feature: string
): Promise<boolean> {
  const entitlements = await getEntitlements(schoolId);
  if (!entitlements.isActive) return false;
  return entitlements.features[feature] === true;
}

/**
 * Require a feature to be enabled. Throws if not available.
 */
export async function requireFeature(
  schoolId: string,
  feature: string
): Promise<void> {
  const enabled = await hasFeature(schoolId, feature);
  if (!enabled) {
    throw new FeatureNotIncludedError(feature);
  }
}

/**
 * Get the usage limits for a school.
 */
export async function getLimits(
  schoolId: string
): Promise<{ students: number; staff: number }> {
  const entitlements = await getEntitlements(schoolId);
  return entitlements.limits;
}

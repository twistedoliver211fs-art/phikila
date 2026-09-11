/**
 * Feature Flags Service
 *
 * Platform and school-level feature toggles.
 * Platform flags apply globally; school flags override per-school.
 */

import { createAdminClient } from "@/lib/supabase/server-admin";
import { FeatureNotIncludedError } from "@/lib/errors";

/**
 * Check if a feature is enabled for a school.
 * Checks school-level override first, then falls back to platform-level flag.
 */
export async function isFeatureEnabled(
  schoolId: string,
  featureKey: string
): Promise<boolean> {
  const admin = createAdminClient();

  // Check school-level override first
  const { data: schoolFlag } = await admin
    .from("school_feature_flags")
    .select("is_enabled")
    .eq("school_id", schoolId)
    .eq("feature_flag_id", (
      await admin
        .from("feature_flags")
        .select("id")
        .eq("key", featureKey)
        .single()
    ).data?.id ?? "")
    .single();

  if (schoolFlag) {
    return schoolFlag.is_enabled;
  }

  // Fall back to platform-level flag
  const { data: platformFlag } = await admin
    .from("feature_flags")
    .select("is_enabled")
    .eq("key", featureKey)
    .single();

  return platformFlag?.is_enabled ?? false;
}

/**
 * Require a feature to be enabled. Throws FeatureNotIncludedError if disabled.
 */
export async function requireFeature(
  schoolId: string,
  featureKey: string
): Promise<void> {
  const enabled = await isFeatureEnabled(schoolId, featureKey);
  if (!enabled) {
    throw new FeatureNotIncludedError(featureKey);
  }
}

/**
 * Get all enabled feature keys for a school.
 */
export async function getEnabledFeatures(schoolId: string): Promise<string[]> {
  const admin = createAdminClient();

  // Get all platform flags
  const { data: platformFlags } = await admin
    .from("feature_flags")
    .select("key, is_enabled");

  // Get school-level overrides
  const { data: schoolOverrides } = await admin
    .from("school_feature_flags")
    .select("feature_flag_id, is_enabled, feature_flags!inner(key)")
    .eq("school_id", schoolId)
    .returns<Array<{
      feature_flag_id: string;
      is_enabled: boolean;
      feature_flags: { key: string };
    }>>();

  const overrideMap = new Map<string, boolean>();
  for (const override of schoolOverrides ?? []) {
    const key = override.feature_flags.key;
    overrideMap.set(key, override.is_enabled);
  }

  const enabled: string[] = [];
  for (const flag of platformFlags ?? []) {
    const override = overrideMap.get(flag.key);
    if (override !== undefined ? override : flag.is_enabled) {
      enabled.push(flag.key);
    }
  }

  return enabled;
}

/**
 * Set a feature flag for a specific school.
 * Only super_admin can manage feature flags.
 */
export async function setSchoolFeature(
  schoolId: string,
  featureKey: string,
  enabled: boolean
): Promise<void> {
  const admin = createAdminClient();

  // Get the feature flag ID
  const { data: flag, error: flagError } = await admin
    .from("feature_flags")
    .select("id")
    .eq("key", featureKey)
    .single();

  if (flagError || !flag) {
    throw new Error(`Feature flag not found: ${featureKey}`);
  }

  // Upsert the school feature flag
  const { error } = await admin
    .from("school_feature_flags")
    .upsert(
      {
        school_id: schoolId,
        feature_flag_id: flag.id,
        is_enabled: enabled,
      },
      { onConflict: "school_id,feature_flag_id" }
    );

  if (error) {
    console.error("[Features] Error setting school feature:", error);
    throw new Error("Failed to update feature flag");
  }
}

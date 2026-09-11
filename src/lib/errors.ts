/**
 * Centralized application error classes.
 *
 * Every error carries:
 *  - `code`      – machine-readable identifier (e.g. "FORBIDDEN")
 *  - `statusCode` – HTTP status to return from API routes
 *  - `metadata`   – optional extra context (never secrets)
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Not authenticated") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 422, details);
    this.name = "ValidationError";
  }
}

export class TenantAccessError extends AppError {
  constructor(message = "Access denied to this school") {
    super(message, "TENANT_ACCESS_DENIED", 403);
    this.name = "TenantAccessError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class SubscriptionRequiredError extends AppError {
  constructor(feature?: string) {
    super(
      feature
        ? `Subscription required for ${feature}`
        : "Active subscription required",
      "SUBSCRIPTION_REQUIRED",
      402
    );
    this.name = "SubscriptionRequiredError";
  }
}

export class FeatureNotIncludedError extends AppError {
  constructor(feature: string) {
    super(
      `Feature not included in your plan: ${feature}`,
      "FEATURE_NOT_INCLUDED",
      403
    );
    this.name = "FeatureNotIncludedError";
  }
}

export class UsageLimitExceededError extends AppError {
  constructor(resource: string, current: number, limit: number) {
    super(
      `${resource} limit reached: ${current}/${limit}`,
      "USAGE_LIMIT_EXCEEDED",
      402,
      { resource, current, limit }
    );
    this.name = "UsageLimitExceededError";
  }
}

export class PaymentError extends AppError {
  constructor(message: string, provider?: string) {
    super(message, "PAYMENT_ERROR", 402, { provider });
    this.name = "PaymentError";
  }
}

export class WebhookError extends AppError {
  constructor(message = "Invalid webhook") {
    super(message, "INVALID_WEBHOOK", 400);
    this.name = "WebhookError";
  }
}

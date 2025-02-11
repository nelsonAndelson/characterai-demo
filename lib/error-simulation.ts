import * as Sentry from "@sentry/nextjs";

// Error types that match our demo data
export const ERROR_TYPES = {
  CONTENT_FILTER: "Content Filter",
  TOKEN_LIMIT: "Token Limit",
  MODERATION_FLAG: "Moderation Flag",
  RESTRICTED_CONTENT: "Restricted Content",
  ETHICAL_VIOLATION: "Ethical Violation",
} as const;

// Synthetic error generator
export function generateSyntheticError(type: keyof typeof ERROR_TYPES) {
  const error = new Error(`Synthetic ${ERROR_TYPES[type]} Error`);

  Sentry.captureException(error, {
    tags: {
      error_type: ERROR_TYPES[type],
      synthetic: true,
      demo: true,
    },
    extra: {
      timestamp: new Date().toISOString(),
      response_time: Math.floor(Math.random() * 600) + 80, // 80-680ms
    },
  });

  return error;
}

// Simulate random errors
export function simulateRandomError() {
  const types = Object.keys(ERROR_TYPES) as Array<keyof typeof ERROR_TYPES>;
  const randomType = types[Math.floor(Math.random() * types.length)];
  return generateSyntheticError(randomType);
}

// Simulate slow response
export function simulateSlowResponse() {
  const startTime = Date.now();
  const duration = Math.floor(Math.random() * 300) + 400; // 400-700ms

  Sentry.addBreadcrumb({
    category: "performance",
    message: "Slow response detected",
    data: {
      duration,
      synthetic: true,
    },
  });

  if (duration > 500) {
    Sentry.captureMessage("High latency detected", {
      level: "warning",
      tags: {
        synthetic: true,
        response_time: duration,
      },
    });
  }

  return duration;
}

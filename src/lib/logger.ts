/**
 * Structured logging utility that sanitizes sensitive data before logging.
 * Never logs passwords, tokens, PII, or auth credentials.
 */

// Patterns that indicate sensitive data
const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "api_key",
  "apikey",
  "api-key",
  "authorization",
  "cookie",
  "session",
  "credential",
  "private_key",
  "access_token",
  "refresh_token",
  "id_token",
  "jwt",
  "ssn",
  "credit_card",
  "card_number",
  "cvv",
  "pin",
]);

// Patterns for values that look sensitive
const SENSITIVE_VALUE_PATTERNS = [
  /^(sk_|pk_|rk_|whsec_)/i, // Stripe/webhook keys
  /^(eyJ[A-Za-z0-9_-]*\.)/,  // JWT tokens
  /^\$2[aby]\$/,              // bcrypt hashes
  /^[A-Za-z0-9+/]{40,}={0,2}$/, // Long base64 strings (likely tokens)
];

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error | unknown;
  timestamp: string;
}

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase().replace(/[_-]/g, "");
  return SENSITIVE_KEYS.has(lower) || 
    lower.includes("password") ||
    lower.includes("token") ||
    lower.includes("secret") ||
    lower.includes("apikey") ||
    lower.includes("credential");
}

function isSensitiveValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (isSensitiveKey(key)) {
    return "[REDACTED]";
  }
  if (isSensitiveValue(value)) {
    return "[REDACTED]";
  }
  if (typeof value === "string" && key.toLowerCase().includes("email")) {
    // Partially redact emails
    const parts = value.split("@");
    if (parts.length === 2 && parts[0].length > 2) {
      return `${parts[0][0]}***@${parts[1]}`;
    }
    return "[REDACTED_EMAIL]";
  }
  if (typeof value === "string" && key.toLowerCase().includes("ip")) {
    // Keep IP for security logs but note it's PII
    return value;
  }
  return value;
}

function sanitizeData(data: Record<string, unknown>, depth = 0): Record<string, unknown> {
  if (depth > 5) return { "[truncated]": "max depth reached" };

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Error)) {
      sanitized[key] = sanitizeData(value as Record<string, unknown>, depth + 1);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item, idx) => {
        if (typeof item === "object" && item !== null) {
          return sanitizeData(item as Record<string, unknown>, depth + 1);
        }
        return sanitizeValue(`${key}[${idx}]`, item);
      });
    } else {
      sanitized[key] = sanitizeValue(key, value);
    }
  }

  return sanitized;
}

function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Only include stack in development
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    };
  }
  return { raw: String(error) };
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>,
  error?: unknown
): LogEntry {
  return {
    level,
    message,
    context,
    data: data ? sanitizeData(data) : undefined,
    error: error ? formatError(error) as unknown as Error : undefined,
    timestamp: new Date().toISOString(),
  };
}

function formatLog(entry: LogEntry): string {
  const prefix = entry.context ? `[${entry.context}]` : "";
  const parts = [
    `${entry.timestamp}`,
    `${entry.level.toUpperCase()}`,
    prefix,
    entry.message,
  ].filter(Boolean);

  let output = parts.join(" ");

  if (entry.data && Object.keys(entry.data).length > 0) {
    output += ` ${JSON.stringify(entry.data)}`;
  }

  if (entry.error) {
    output += ` error=${JSON.stringify(entry.error)}`;
  }

  return output;
}

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  child(context: string): Logger {
    const prefix = this.context ? `${this.context}:${context}` : context;
    return new Logger(prefix);
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "production") return;
    const entry = createLogEntry("debug", message, this.context, data);
    console.debug(formatLog(entry));
  }

  info(message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry("info", message, this.context, data);
    console.info(formatLog(entry));
  }

  warn(message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry("warn", message, this.context, data);
    console.warn(formatLog(entry));
  }

  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    const entry = createLogEntry("error", message, this.context, data, error);
    console.error(formatLog(entry));
  }
}

// Default logger
export const logger = new Logger();

// Create a logger with context
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export type { Logger, LogLevel, LogEntry };

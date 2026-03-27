import { createClient } from "@/lib/supabase/server";

export type AuditAction =
  | "verification_approved"
  | "verification_rejected"
  | "profile_deleted"
  | "user_banned"
  | "admin_login"
  | "admin_logout"
  | "settings_changed";

interface AuditLogEntry {
  action: AuditAction;
  targetId?: string;
  targetType?: "profile" | "user" | "message" | "verification";
  details?: Record<string, unknown>;
  adminIp?: string;
}

/**
 * Log an admin action for audit trail
 * Stores in database for compliance and debugging
 */
export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    // Try to insert into audit_logs table
    // If table doesn't exist, fall back to console logging
    const { error } = await supabase
      .from("admin_audit_logs")
      .insert({
        action: entry.action,
        target_id: entry.targetId || null,
        target_type: entry.targetType || null,
        details: entry.details || {},
        admin_ip: entry.adminIp || null,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Table might not exist yet - log to console as fallback
      console.log("[AUDIT]", JSON.stringify({
        timestamp: new Date().toISOString(),
        ...entry,
      }));
    }
  } catch (err) {
    // Fallback to console logging if database fails
    console.log("[AUDIT]", JSON.stringify({
      timestamp: new Date().toISOString(),
      ...entry,
    }));
    console.error("[audit-log] Error saving audit log:", err);
  }
}

/**
 * Get IP address from request headers for audit logging
 */
export function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

// Production security: These MUST be set in environment variables
const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;
const ADMIN_JWT_SECRET = env.ADMIN_JWT_SECRET;

// Validate required environment variables (called lazily, not at module load)
function validateEnvVars() {
  const missing: string[] = [];
  if (!ADMIN_EMAIL) missing.push("ADMIN_EMAIL");
  if (!ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!ADMIN_JWT_SECRET) missing.push("ADMIN_JWT_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `Missing required admin environment variables: ${missing.join(", ")}. ` +
      `Please set these in your .env.local or production environment.`
    );
  }
}

// Lazily encode JWT secret — validated when actually used, not at build time
function getJwtSecret() {
  validateEnvVars();
  return new TextEncoder().encode(ADMIN_JWT_SECRET);
}

export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  // Extra safety check in case validation was somehow bypassed
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Admin credentials not configured");
    return false;
  }

  // Check email first (case-insensitive)
  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return false;
  }

  // ADMIN_PASSWORD must be a bcrypt hash — no plaintext fallback
  const isHashedPassword = ADMIN_PASSWORD.startsWith("$2a$") || ADMIN_PASSWORD.startsWith("$2b$");

  if (!isHashedPassword) {
    console.error(
      "[SECURITY] ADMIN_PASSWORD is not a bcrypt hash. " +
      "Plaintext passwords are not allowed. " +
      "Generate a hash with: npx bcryptjs hash <password>"
    );
    return false;
  }

  return await bcrypt.compare(password, ADMIN_PASSWORD);
}

export async function createAdminSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());

  return token;
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return false;
    }

    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

// Check if a user ID is an admin (for API routes that need user-based admin check)
export function isAdmin(userId: string): boolean {
  // For now, admin is determined by the admin session, not by user ID
  // This is a placeholder - in production, you might want to check against a list of admin user IDs
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];
  return adminUserIds.includes(userId);
}

// Utility to generate bcrypt hash for password setup
// Usage: npx ts-node -e "import { hashPassword } from './src/lib/admin-auth'; hashPassword('your-password').then(console.log)"
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

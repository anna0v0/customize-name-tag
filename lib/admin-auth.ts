import { getFirebaseAdmin } from "./firebase-admin";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const decoded = await getFirebaseAdmin().auth.verifyIdToken(authorization.slice(7));
    return decoded.email ? decoded : null;
  } catch {
    return null;
  }
}

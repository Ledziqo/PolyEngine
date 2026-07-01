import { cookies } from "next/headers";

export const OWNER_EMAIL = "Aesliexx@gmail.com";
export const OWNER_PASSWORD = "Mudi2005";
export const AUTH_COOKIE = "polyengine_owner";

export async function isOwnerSession() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "active";
}

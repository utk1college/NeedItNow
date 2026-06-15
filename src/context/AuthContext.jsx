/**
 * AuthContext — Cognito-backed authentication.
 *
 * Uses Amazon Cognito Hosted UI (redirect flow) via the standard
 * Authorization Code + PKCE flow.  No Amplify library needed — just
 * fetch + localStorage.
 *
 * What it does:
 *  1. On mount: checks localStorage for an existing session token.
 *  2. On mount: detects the Cognito redirect callback (?code=...) and
 *     exchanges the code for tokens automatically.
 *  3. Exposes { user, isLoading, signIn, signOut, isAuthenticated }.
 *
 * Config (set in .env):
 *   VITE_COGNITO_DOMAIN      e.g. needitnow.auth.ap-south-1.amazoncognito.com
 *   VITE_COGNITO_CLIENT_ID   e.g. 3abc123xyz...
 *   VITE_COGNITO_REDIRECT    e.g. https://main.xxxx.amplifyapp.com  (no trailing slash)
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { upsertUser } from "../utils/api";

// ── Cognito config from env ───────────────────────────────────────────────────
const COGNITO_DOMAIN   = import.meta.env.VITE_COGNITO_DOMAIN   ?? "";
const CLIENT_ID        = import.meta.env.VITE_COGNITO_CLIENT_ID ?? "";
const REDIRECT_URI     = import.meta.env.VITE_COGNITO_REDIRECT  ?? window.location.origin;
const STORAGE_KEY      = "needitnow_auth";

// ── PKCE helpers ──────────────────────────────────────────────────────────────
function b64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generatePKCE() {
  const verifier  = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const digest    = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = b64url(digest);
  return { verifier, challenge };
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Read stored session synchronously (lazy initializer — no effect) ──────────
function readStoredSession() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
      // Fix: if stored name looks like a UUID (contains dashes and is long), re-derive from email
      if (parsed.name && /^[0-9a-f-]{36}$/i.test(parsed.name) && parsed.email) {
        parsed.name = parsed.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

// ── Detect whether a Cognito OAuth callback is in progress (lazy) ─────────────
function hasPendingOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  return (
    !!params.get("code") &&
    !!sessionStorage.getItem("pkce_verifier") &&
    !!COGNITO_DOMAIN &&
    !!CLIENT_ID
  );
}

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(readStoredSession); // restore on first render
  // Only "loading" if we must exchange an OAuth code; otherwise ready immediately.
  const [isLoading, setIsLoading] = useState(hasPendingOAuthCallback);

  // ── Handle Cognito redirect callback (?code=...) ───────────────────────────
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const code     = params.get("code");
    const verifier = sessionStorage.getItem("pkce_verifier");

    // No pending OAuth callback — nothing to do (isLoading already false)
    if (!code || !verifier || !COGNITO_DOMAIN || !CLIENT_ID) {
      return;
    }

    // Remove code from URL immediately so it won't re-run on refresh
    window.history.replaceState({}, "", window.location.pathname);
    sessionStorage.removeItem("pkce_verifier");

    (async () => {
      try {
        const tokenRes = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
          method:  "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type:           "authorization_code",
            client_id:            CLIENT_ID,
            redirect_uri:         REDIRECT_URI,
            code,
            code_verifier:        verifier,
          }),
        });

        if (!tokenRes.ok) throw new Error("Token exchange failed");

        const tokens    = await tokenRes.json();
        const idPayload = JSON.parse(atob(tokens.id_token.split(".")[1]));

        // Derive a friendly display name:
        // 1. Use 'name' attribute if Cognito collected it
        // 2. Use email prefix (part before @) as fallback
        // 3. Last resort: hardcoded default
        const email = idPayload.email ?? "";
        const emailPrefix = email
          ? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
          : "";
        const displayName =
          idPayload.name ??
          (idPayload["cognito:username"] && !idPayload["cognito:username"].includes("-")
            ? idPayload["cognito:username"]
            : null) ??
          emailPrefix ??
          "Aahil Sharma";

        const profile = {
          userId:    idPayload.sub,
          name:      displayName,
          email,
          idToken:   tokens.id_token,
          expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
        };

        // Persist to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setUser(profile);

        // Sync user profile to DynamoDB (fire-and-forget)
        upsertUser({
          userId:  profile.userId,
          name:    profile.name,
          email:   profile.email,
        }).catch(console.warn);

      } catch (err) {
        console.error("[Auth] Token exchange error:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── signIn — redirect to Cognito Hosted UI ─────────────────────────────────
  const signIn = useCallback(async () => {
    if (!COGNITO_DOMAIN || !CLIENT_ID) {
      console.warn("[Auth] Cognito not configured — using demo user");
      // Fallback: set a demo user so the app still works without Cognito
      const demo = {
        userId:    "demo_aahil",
        name:      "Aahil Sharma",
        email:     "aahil.sharma@gmail.com",
        idToken:   "demo_token",
        expiresAt: Date.now() + 24 * 3600 * 1000,
        isDemo:    true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      setUser(demo);

      // Sync to DynamoDB
      upsertUser({ userId: demo.userId, name: demo.name, email: demo.email })
        .catch(console.warn);
      return;
    }

    const { verifier, challenge } = await generatePKCE();
    sessionStorage.setItem("pkce_verifier", verifier);

    const url = new URL(`https://${COGNITO_DOMAIN}/oauth2/authorize`);
    url.searchParams.set("response_type",          "code");
    url.searchParams.set("client_id",              CLIENT_ID);
    url.searchParams.set("redirect_uri",           REDIRECT_URI);
    url.searchParams.set("scope",                  "openid email profile");
    url.searchParams.set("code_challenge",         challenge);
    url.searchParams.set("code_challenge_method",  "S256");

    window.location.href = url.toString();
  }, []);

  // ── signOut ────────────────────────────────────────────────────────────────
  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);

    if (COGNITO_DOMAIN && CLIENT_ID) {
      const url = new URL(`https://${COGNITO_DOMAIN}/logout`);
      url.searchParams.set("client_id",   CLIENT_ID);
      url.searchParams.set("logout_uri",  REDIRECT_URI);
      window.location.href = url.toString();
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

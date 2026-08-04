import passport from "passport";
import passportGitHub from "passport-github2";
import passportGoogle from "passport-google-oauth20";
import crypto from "crypto";
import { findAccount, createAccount, hashPassword } from "./store.js";

const GitHubStrategy = passportGitHub.Strategy;
const GoogleStrategy = passportGoogle.Strategy;

const APP_URL = process.env.APP_URL || "http://localhost:3001";

// We only use passport sessions briefly for OAuth state; real sessions live in accounts.json
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ── Shared helper: find or create account for OAuth user ─────────────────────
function upsertOAuthAccount(email, name) {
  let account = findAccount(email);
  if (!account) {
    // Create account with random unguessable password hash (OAuth users can't log in with a password)
    createAccount({
      name,
      email,
      passwordHash: hashPassword(crypto.randomBytes(32).toString("hex")),
    });
    account = findAccount(email);
  }
  return { email, name: account?.name || name };
}

// ── GitHub Strategy ───────────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${APP_URL}/api/auth/github/callback`,
        scope: ["user:email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.find((e) => e.primary)?.value ||
            profile.emails?.[0]?.value;
          if (!email) {
            return done(null, false, {
              message: "GitHub account has no visible email. Please make your email public on GitHub and try again.",
            });
          }
          const name = profile.displayName || profile.username || "GitHub User";
          const user = upsertOAuthAccount(email, name);
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

// ── Google Strategy ───────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${APP_URL}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(null, false, {
              message: "Could not retrieve email from Google account.",
            });
          }
          const name = profile.displayName || "Google User";
          const user = upsertOAuthAccount(email, name);
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

export default passport;

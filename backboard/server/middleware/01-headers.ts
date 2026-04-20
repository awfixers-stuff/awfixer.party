import { defineHandler } from "nitro";
import type { H3Event } from "h3";
import { setResponseHeader } from "h3";

import { logger } from "../utils/logger";

function parseAllowedOrigins(): string[] {
  const raw = process.env.BACKBOARD_ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function applyCorsHeaders(event: H3Event, origin: string) {
  setResponseHeader(event, "Access-Control-Allow-Credentials", "true");
  setResponseHeader(event, "Access-Control-Allow-Origin", origin);
  setResponseHeader(
    event,
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  setResponseHeader(
    event,
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  );
}

export default defineHandler((event) => {
  if (process.env.NODE_ENV === "development") {
    return;
  }

  const allowed = parseAllowedOrigins();
  const origin = event.req.headers.get("origin");

  if (allowed.length === 0) {
    logger.warn(
      "BACKBOARD_ALLOWED_ORIGINS is empty in production; browser CORS will reject cross-origin requests until set.",
    );
  }

  if (event.req.method === "OPTIONS") {
    if (!origin || allowed.includes(origin)) {
      if (origin) {
        applyCorsHeaders(event, origin);
      }
      return new Response(null, { status: 204 });
    }
    return new Response("Origin not allowed", { status: 403 });
  }

  if (origin && !allowed.includes(origin)) {
    return new Response("Origin not allowed", { status: 403 });
  }

  if (origin && allowed.includes(origin)) {
    applyCorsHeaders(event, origin);
  }
  return undefined;
});

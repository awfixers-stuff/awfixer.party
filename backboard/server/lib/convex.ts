import { ConvexHttpClient } from "convex/browser";

import { api } from "../../../convex/_generated/api.js";

let client: ConvexHttpClient | null = null;

export function getConvexDeploymentUrl(): string | null {
  const raw =
    process.env.BACKBOARD_CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

export function getConvexClient(): ConvexHttpClient {
  const url = getConvexDeploymentUrl();
  if (!url) {
    throw new Error("missing BACKBOARD_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL");
  }
  if (!client) {
    client = new ConvexHttpClient(url);
  }
  return client;
}

export { api };

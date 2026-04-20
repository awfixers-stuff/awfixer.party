import { defineHandler } from "nitro";
import { getQuery } from "h3";

import { api, getConvexClient, getConvexDeploymentUrl } from "../../lib/convex";

export default defineHandler(async (event) => {
  if (!getConvexDeploymentUrl()) {
    return Response.json(
      { error: "Convex URL not configured" },
      { status: 503 },
    );
  }
  const q = getQuery(event);
  const path = typeof q.path === "string" ? q.path : "";
  if (!path.trim()) {
    return Response.json({ error: "missing path query" }, { status: 400 });
  }
  try {
    const normalized = path.trim().startsWith("/")
      ? path.trim()
      : `/${path.trim()}`;
    const items = await getConvexClient().query(api.toc.getTocForPath, {
      path: normalized.replace(/\/+$/, "") || "/",
    });
    return Response.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Convex query failed";
    return Response.json({ error: message }, { status: 502 });
  }
});

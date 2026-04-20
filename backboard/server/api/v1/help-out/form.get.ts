import { defineHandler } from "nitro";
import { getQuery } from "h3";

import { api, getConvexClient, getConvexDeploymentUrl } from "../../../lib/convex";

export default defineHandler(async (event) => {
  if (!getConvexDeploymentUrl()) {
    return Response.json(
      { error: "Convex URL not configured" },
      { status: 503 },
    );
  }
  const q = getQuery(event);
  const roleSlug = typeof q.roleSlug === "string" ? q.roleSlug : "";
  if (!roleSlug.trim()) {
    return Response.json({ error: "missing roleSlug query" }, { status: 400 });
  }
  try {
    const data = await getConvexClient().query(api.helpOut.getFormByRole, {
      roleSlug: roleSlug.trim(),
    });
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Convex query failed";
    return Response.json({ error: message }, { status: 502 });
  }
});

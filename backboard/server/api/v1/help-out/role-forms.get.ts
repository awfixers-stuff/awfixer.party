import { defineHandler } from "nitro";

import { api, getConvexClient, getConvexDeploymentUrl } from "../../../lib/convex";

export default defineHandler(async () => {
  if (!getConvexDeploymentUrl()) {
    return Response.json(
      { error: "Convex URL not configured" },
      { status: 503 },
    );
  }
  try {
    const rows = await getConvexClient().query(api.helpOut.getRoleForms, {});
    return Response.json(rows);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Convex query failed";
    return Response.json({ error: message }, { status: 502 });
  }
});

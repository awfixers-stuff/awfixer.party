import { defineHandler } from "nitro";

import { api, getConvexClient, getConvexDeploymentUrl } from "../../lib/convex";

export default defineHandler(async () => {
  if (!getConvexDeploymentUrl()) {
    return Response.json(
      { error: "Convex URL not configured" },
      { status: 503 },
    );
  }
  try {
    const data = await getConvexClient().query(api.siteChrome.getSiteChrome, {});
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Convex query failed";
    return Response.json({ error: message }, { status: 502 });
  }
});

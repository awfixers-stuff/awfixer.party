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
    const slugs = await getConvexClient().query(
      api.sitePages.listPublishedLegalSlugs,
      {},
    );
    return Response.json({ slugs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Convex query failed";
    return Response.json({ error: message }, { status: 502 });
  }
});

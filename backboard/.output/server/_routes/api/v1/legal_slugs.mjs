import { r as defineHandler } from "../../../_libs/h3+rou3+srvx.mjs";
import { n as getConvexDeploymentUrl, r as api, t as getConvexClient } from "../../../_chunks/convex.mjs";
//#region server/api/v1/legal-slugs.get.ts
var legal_slugs_get_default = defineHandler(async () => {
	if (!getConvexDeploymentUrl()) return Response.json({ error: "Convex URL not configured" }, { status: 503 });
	try {
		const slugs = await getConvexClient().query(api.sitePages.listPublishedLegalSlugs, {});
		return Response.json({ slugs });
	} catch (e) {
		const message = e instanceof Error ? e.message : "Convex query failed";
		return Response.json({ error: message }, { status: 502 });
	}
});
//#endregion
export { legal_slugs_get_default as default };

import { a as getQuery, r as defineHandler } from "../../../../_libs/h3+rou3+srvx.mjs";
import { n as getConvexDeploymentUrl, r as api, t as getConvexClient } from "../../../../_chunks/convex.mjs";
//#region server/api/v1/pages/by-path.get.ts
var by_path_get_default = defineHandler(async (event) => {
	if (!getConvexDeploymentUrl()) return Response.json({ error: "Convex URL not configured" }, { status: 503 });
	const q = getQuery(event);
	const path = typeof q.path === "string" ? q.path : "";
	if (!path.trim()) return Response.json({ error: "missing path query" }, { status: 400 });
	try {
		const normalized = path.trim().startsWith("/") ? path.trim() : `/${path.trim()}`;
		const data = await getConvexClient().query(api.sitePages.getPageByPath, { path: normalized.replace(/\/+$/, "") || "/" });
		return Response.json(data);
	} catch (e) {
		const message = e instanceof Error ? e.message : "Convex query failed";
		return Response.json({ error: message }, { status: 502 });
	}
});
//#endregion
export { by_path_get_default as default };

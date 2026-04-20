import { r as defineHandler } from "../../../_libs/h3+rou3+srvx.mjs";
import { n as getConvexDeploymentUrl, r as api, t as getConvexClient } from "../../../_chunks/convex.mjs";
//#region server/api/v1/site-chrome.get.ts
var site_chrome_get_default = defineHandler(async () => {
	if (!getConvexDeploymentUrl()) return Response.json({ error: "Convex URL not configured" }, { status: 503 });
	try {
		const data = await getConvexClient().query(api.siteChrome.getSiteChrome, {});
		return Response.json(data);
	} catch (e) {
		const message = e instanceof Error ? e.message : "Convex query failed";
		return Response.json({ error: message }, { status: 502 });
	}
});
//#endregion
export { site_chrome_get_default as default };

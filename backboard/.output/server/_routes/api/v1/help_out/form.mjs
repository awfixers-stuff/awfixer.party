import { a as getQuery, r as defineHandler } from "../../../../_libs/h3+rou3+srvx.mjs";
import { n as getConvexDeploymentUrl, r as api, t as getConvexClient } from "../../../../_chunks/convex.mjs";
//#region server/api/v1/help-out/form.get.ts
var form_get_default = defineHandler(async (event) => {
	if (!getConvexDeploymentUrl()) return Response.json({ error: "Convex URL not configured" }, { status: 503 });
	const q = getQuery(event);
	const roleSlug = typeof q.roleSlug === "string" ? q.roleSlug : "";
	if (!roleSlug.trim()) return Response.json({ error: "missing roleSlug query" }, { status: 400 });
	try {
		const data = await getConvexClient().query(api.helpOut.getFormByRole, { roleSlug: roleSlug.trim() });
		return Response.json(data);
	} catch (e) {
		const message = e instanceof Error ? e.message : "Convex query failed";
		return Response.json({ error: message }, { status: 502 });
	}
});
//#endregion
export { form_get_default as default };

import { r as defineHandler } from "../../../../_libs/h3+rou3+srvx.mjs";
import { n as getConvexDeploymentUrl, r as api, t as getConvexClient } from "../../../../_chunks/convex.mjs";
//#region server/api/v1/help-out/role-forms.get.ts
var role_forms_get_default = defineHandler(async () => {
	if (!getConvexDeploymentUrl()) return Response.json({ error: "Convex URL not configured" }, { status: 503 });
	try {
		const rows = await getConvexClient().query(api.helpOut.getRoleForms, {});
		return Response.json(rows);
	} catch (e) {
		const message = e instanceof Error ? e.message : "Convex query failed";
		return Response.json({ error: message }, { status: 502 });
	}
});
//#endregion
export { role_forms_get_default as default };

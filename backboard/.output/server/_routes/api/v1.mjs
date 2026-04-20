import { r as defineHandler } from "../../_libs/h3+rou3+srvx.mjs";
//#region server/api/v1/index.get.ts
var index_get_default = defineHandler(() => {
	return {
		ok: true,
		service: "backboard",
		version: "v1"
	};
});
//#endregion
export { index_get_default as default };

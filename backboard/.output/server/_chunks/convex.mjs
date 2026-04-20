import { n as ConvexHttpClient, r as anyApi, t as componentsGeneric } from "../_libs/convex.mjs";
//#region ../convex/_generated/api.js
/**
* Generated `api` utility.
*
* THIS CODE IS AUTOMATICALLY GENERATED.
*
* To regenerate, run `bunx --bun convex dev`.
* @module
*/
/**
* A utility for referencing Convex functions in your app's API.
*
* Usage:
* ```js
* const myFunctionReference = api.myModule.myFunction;
* ```
*/
const api = anyApi;
componentsGeneric();
//#endregion
//#region server/lib/convex.ts
let client = null;
function getConvexDeploymentUrl() {
	const raw = process.env.BACKBOARD_CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
	if (typeof raw !== "string") return null;
	const t = raw.trim();
	return t.length > 0 ? t : null;
}
function getConvexClient() {
	const url = getConvexDeploymentUrl();
	if (!url) throw new Error("missing BACKBOARD_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL");
	if (!client) client = new ConvexHttpClient(url);
	return client;
}
//#endregion
export { getConvexDeploymentUrl as n, api as r, getConvexClient as t };

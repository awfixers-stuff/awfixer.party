globalThis.__nitro_main__ = import.meta.url;
import { r as __toESM } from "./_runtime.mjs";
import { c as NodeResponse, i as defineLazyEventHandler, l as serve, n as HTTPError, o as setResponseHeader, r as defineHandler, s as toEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import "./_libs/hookable.mjs";
import { t as getContext } from "./_libs/unctx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { t as require_pino } from "./_libs/pino+[...].mjs";
import { t as require_pino_pretty } from "./_libs/pino-pretty+[...].mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
getContext("nitro-app", {
	asyncContext: void 0,
	AsyncLocalStorage: void 0
});
//#endregion
//#region ../node_modules/.bun/nitro@3.0.260415-beta+949b3dd7035489cf/node_modules/nitro/dist/runtime/internal/error/prod.mjs
const errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
const errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region ../node_modules/.bun/nitro@3.0.260415-beta+949b3dd7035489cf/node_modules/nitro/dist/runtime/internal/route-rules.mjs
const headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region ../node_modules/.bun/nitro@3.0.260415-beta+949b3dd7035489cf/node_modules/nitro/dist/runtime/internal/static.mjs
const METHODS = new Set(["HEAD", "GET"]);
const EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region server/utils/logger.ts
var import_pino = /* @__PURE__ */ __toESM(require_pino(), 1);
const stream = (0, (/* @__PURE__ */ __toESM(require_pino_pretty(), 1)).default)({
	levelFirst: true,
	colorize: true,
	ignore: "time,hostname,pid"
});
const logger = (0, import_pino.default)({}, stream);
//#endregion
//#region server/middleware/01-headers.ts
function parseAllowedOrigins() {
	return (process.env.BACKBOARD_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}
function applyCorsHeaders(event, origin) {
	setResponseHeader(event, "Access-Control-Allow-Credentials", "true");
	setResponseHeader(event, "Access-Control-Allow-Origin", origin);
	setResponseHeader(event, "Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
	setResponseHeader(event, "Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
}
var _01_headers_default = defineHandler((event) => {
	if (process.env.NODE_ENV === "development") return;
	const allowed = parseAllowedOrigins();
	const origin = event.req.headers.get("origin");
	if (allowed.length === 0) logger.warn("BACKBOARD_ALLOWED_ORIGINS is empty in production; browser CORS will reject cross-origin requests until set.");
	if (event.req.method === "OPTIONS") {
		if (!origin || allowed.includes(origin)) {
			if (origin) applyCorsHeaders(event, origin);
			return new Response(null, { status: 204 });
		}
		return new Response("Origin not allowed", { status: 403 });
	}
	if (origin && !allowed.includes(origin)) return new Response("Origin not allowed", { status: 403 });
	if (origin && allowed.includes(origin)) applyCorsHeaders(event, origin);
});
//#endregion
//#region server/middleware/02-logger.ts
var _02_logger_default = defineHandler((event) => {
	const start = performance.now();
	const method = event.req.method;
	const path = event.url.pathname;
	const res = event.node?.res;
	if (res) res.on("finish", () => {
		const ms = (performance.now() - start).toFixed(0);
		const code = res.statusCode ?? 0;
		logger.info(`-> ${method} ${path} ${code} ${ms}ms`);
	});
	else logger.info(`-> ${method} ${path}`);
});
//#endregion
//#region #nitro/virtual/routing
const findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/api/v1/**",
		handler: headers,
		options: { "cache-control": "s-maxage=0" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/"), l = s.length;
		if (l > 1) {
			if (s[1] === "api") {
				if (l > 2) {
					if (s[2] === "v1") r.unshift({
						data: $0,
						params: { "_": s.slice(3).join("/") }
					});
				}
			}
		}
		return r;
	};
})();
const _lazy_DeRQK7 = defineLazyEventHandler(() => import("./_routes/api/v1/help_out/form.mjs"));
const _lazy_zCmqXW = defineLazyEventHandler(() => import("./_routes/api/v1/help_out/picklists.mjs"));
const _lazy_Aclwdj = defineLazyEventHandler(() => import("./_routes/api/v1/help_out/role_forms.mjs"));
const _lazy_9z_TBj = defineLazyEventHandler(() => import("./_routes/api/v1.mjs"));
const _lazy_YtraSd = defineLazyEventHandler(() => import("./_routes/api/v1/legal_slugs.mjs"));
const _lazy__XgAgG = defineLazyEventHandler(() => import("./_routes/api/v1/newsletter.mjs"));
const _lazy_NKhHjt = defineLazyEventHandler(() => import("./_routes/api/v1/pages/by_path.mjs"));
const _lazy_OYMiFW = defineLazyEventHandler(() => import("./_routes/api/v1/site_chrome.mjs"));
const _lazy_gDHhfu = defineLazyEventHandler(() => import("./_routes/api/v1/toc.mjs"));
const findRoute = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/api/v1/help-out/form",
		method: "get",
		handler: _lazy_DeRQK7
	}, $1 = {
		route: "/api/v1/help-out/picklists",
		method: "get",
		handler: _lazy_zCmqXW
	}, $2 = {
		route: "/api/v1/help-out/role-forms",
		method: "get",
		handler: _lazy_Aclwdj
	}, $3 = {
		route: "/api/v1",
		method: "get",
		handler: _lazy_9z_TBj
	}, $4 = {
		route: "/api/v1/legal-slugs",
		method: "get",
		handler: _lazy_YtraSd
	}, $5 = {
		route: "/api/v1/newsletter",
		method: "get",
		handler: _lazy__XgAgG
	}, $6 = {
		route: "/api/v1/pages/by-path",
		method: "get",
		handler: _lazy_NKhHjt
	}, $7 = {
		route: "/api/v1/site-chrome",
		method: "get",
		handler: _lazy_OYMiFW
	}, $8 = {
		route: "/api/v1/toc",
		method: "get",
		handler: _lazy_gDHhfu
	};
	return (m, p) => {
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		if (p === "/api/v1/help-out/form") {
			if (m === "GET") return { data: $0 };
		} else if (p === "/api/v1/help-out/picklists") {
			if (m === "GET") return { data: $1 };
		} else if (p === "/api/v1/help-out/role-forms") {
			if (m === "GET") return { data: $2 };
		} else if (p === "/api/v1") {
			if (m === "GET") return { data: $3 };
		} else if (p === "/api/v1/legal-slugs") {
			if (m === "GET") return { data: $4 };
		} else if (p === "/api/v1/newsletter") {
			if (m === "GET") return { data: $5 };
		} else if (p === "/api/v1/pages/by-path") {
			if (m === "GET") return { data: $6 };
		} else if (p === "/api/v1/site-chrome") {
			if (m === "GET") return { data: $7 };
		} else if (p === "/api/v1/toc") {
			if (m === "GET") return { data: $8 };
		}
	};
})();
const globalMiddleware = [
	toEventHandler(static_default),
	toEventHandler(_01_headers_default),
	toEventHandler(_02_logger_default)
].filter(Boolean);
//#endregion
//#region ../node_modules/.bun/nitro@3.0.260415-beta+949b3dd7035489cf/node_modules/nitro/dist/runtime/internal/app.mjs
const APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function createNitroApp() {
	const hooks = void 0;
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		{
			const routeRules = getRouteRules(method, pathname);
			event.context.routeRules = routeRules?.routeRules;
			if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		}
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region ../node_modules/.bun/nitro@3.0.260415-beta+949b3dd7035489cf/node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
const tracingSrvxPlugins = [];
//#endregion
//#region ../node_modules/.bun/nitro@3.0.260415-beta+949b3dd7035489cf/node_modules/nitro/dist/presets/node/runtime/node-server.mjs
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };

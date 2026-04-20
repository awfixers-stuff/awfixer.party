/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `bunx --bun convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as defaults from "../defaults.js";
import type * as helpOut from "../helpOut.js";
import type * as http from "../http.js";
import type * as lib_adminAuth from "../lib/adminAuth.js";
import type * as lib_formDefaults from "../lib/formDefaults.js";
import type * as lib_formLimits from "../lib/formLimits.js";
import type * as lib_tiptapToc from "../lib/tiptapToc.js";
import type * as linkShortener from "../linkShortener.js";
import type * as llmsTxt from "../llmsTxt.js";
import type * as newsletter from "../newsletter.js";
import type * as siteChrome from "../siteChrome.js";
import type * as sitePages from "../sitePages.js";
import type * as toc from "../toc.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  defaults: typeof defaults;
  helpOut: typeof helpOut;
  http: typeof http;
  "lib/adminAuth": typeof lib_adminAuth;
  "lib/formDefaults": typeof lib_formDefaults;
  "lib/formLimits": typeof lib_formLimits;
  "lib/tiptapToc": typeof lib_tiptapToc;
  linkShortener: typeof linkShortener;
  llmsTxt: typeof llmsTxt;
  newsletter: typeof newsletter;
  siteChrome: typeof siteChrome;
  sitePages: typeof sitePages;
  toc: typeof toc;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  linkShortener: import("@the_shujaa/link-shortener/_generated/component.js").ComponentApi<"linkShortener">;
};

import { defineHandler } from "nitro";

import { logger } from "../utils/logger";

export default defineHandler((event) => {
  const start = performance.now();
  const method = event.req.method;
  const path = event.url.pathname;
  const node = event.node;
  const res = node?.res;
  if (res) {
    res.on("finish", () => {
      const ms = (performance.now() - start).toFixed(0);
      const code = res.statusCode ?? 0;
      logger.info(`-> ${method} ${path} ${code} ${ms}ms`);
    });
  } else {
    logger.info(`-> ${method} ${path}`);
  }
});

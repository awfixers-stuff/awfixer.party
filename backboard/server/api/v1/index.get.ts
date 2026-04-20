import { defineHandler } from "nitro";

export default defineHandler(() => {
  return {
    ok: true,
    service: "backboard",
    version: "v1",
  };
});

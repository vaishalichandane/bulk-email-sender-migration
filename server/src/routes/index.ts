import { Hono } from "hono";

// Old frontend static-file serving removed as part of the SvelteKit/Next.js
// migration — the new frontend is a separate app served by Next.js, not by
// this Hono backend. This router is intentionally left minimal; it exists
// so app.ts's app.route("/", indexRoutes) still has a valid router to mount.
const app = new Hono();

export default app;

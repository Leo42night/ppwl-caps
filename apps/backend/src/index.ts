import { Elysia } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import type { ApiResponse, HealthCheck } from "shared";
import type { DbClient } from "./types";
import { authRoutes } from "./routes/auth.routes";
import { dataRoutes } from "./routes/dataRoutes";

// Factory menerima `getPrisma` sebagai dependency injection
// sehingga dev pakai LibSQL, prod pakai PostgreSQL — tanpa mengubah routes
export const createApp = (getPrisma: () => DbClient) => {
  const app = new Elysia()
    .use(cookie()) // untuk sesions cookie
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
        exp: "1d",
      })
    )
    // Health check
    .get("/", (): ApiResponse<HealthCheck> => ({
      data: { status: "ok" },
      message: "server running",
    }))

    .use(authRoutes(getPrisma))
    .use(dataRoutes(getPrisma));

  return app;
};
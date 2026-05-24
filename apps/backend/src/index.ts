import { Elysia } from "elysia";
import { cookie } from "@elysiajs/cookie";
import type { ApiResponse, HealthCheck } from "shared";
import type { DbClient } from "./types";
import { authRoutes } from "./routes/authRoutes";
import { dataRoutes } from "./routes/dataRoutes";
import { postRoutes } from "./routes/postRoutes";
import { profileRoutes } from "./routes/profileRoutes";
import { notifRoutes } from "./routes/notifRoutes";
import { commentRoutes } from "./routes/commentRoutes";

// sehingga dev pakai LibSQL, prod pakai PostgreSQL — tanpa mengubah routes
export const createApp = (getPrisma: () => DbClient) => {
  const app = new Elysia()
    .use(cookie()) // untuk sesions cookie
    // Health check
    .get("/", (): ApiResponse<HealthCheck> => ({
      data: { status: "ok" },
      message: "server running",
    }))

    // Public
    .use(authRoutes(getPrisma)) // jwt letakkan dalam sini
    .use(dataRoutes(getPrisma))
    .use(notifRoutes(getPrisma)) // hanya ubah akses notif terbaca, tidak butuh verifikasi user
    // Protected: Menggunakan Middleware token, jadi route setelahnya harus ada token.
    .use(postRoutes(getPrisma))
    .use(profileRoutes(getPrisma))
    .use(commentRoutes(getPrisma));

  return app;
};
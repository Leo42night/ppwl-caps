import { Elysia } from "elysia";
import type { DbClient } from "../types"; // Sesuaikan dengan lokasi tipe DbClient Anda

let prismaLocal: any;

// async function initializeDatabase() {
//     if (process.env.NODE_ENV === "dev") {
//         const { Prisma } = await import("../generated/prisma/client");
//         prismaLocal = Prisma;
//     } else {
//         const { Prisma } = await import("../generated/prisma-pg/client");
//         prismaLocal = Prisma;
//     }
// }

export const dataRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: "/data" }) // Otomatis menambahkan prefix /data di semua rute di dalam file ini
        // Middleware khusus untuk grup /data
        .onRequest(({ request, set }) => {
            const url = new URL(request.url);
            console.log(`[DEBUG] [${request.method}] ${url.pathname}`);

            console.log("[DEBUG] AWS_LAMBDA_FUNCTION_NAME ", process.env.AWS_LAMBDA_FUNCTION_NAME);
            if (!process.env.AWS_LAMBDA_FUNCTION_NAME) return;

            // Lewati preflight OPTIONS
            if (request.method === "OPTIONS") return;

            // Sisa pengecekan origin dan API Key
            const origin = request.headers.get("origin");
            const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
            const key = url.searchParams.get("key");

            if (origin === frontendUrl) return;

            const apiKey = process.env.API_KEY || "ok";
            if (key !== apiKey) {
                set.status = 401;
                return { message: "Unauthorized: Access denied without valid API Key" };
            }
        })
        // Rute-rute /data (tidak perlu menuliskan "/data" lagi karena sudah memakai prefix)
        // 1. GET ALL USERS
        .get("/user", async () => {
            const data = await getPrisma().user.findMany();
            return { data, message: "Users retrieved successfully" };
        })

        // 2. GET ALL POSTS
        .get("/post", async () => {
            const data = await getPrisma().post.findMany({
                include: {
                    user: true, // Opsional: relasi ke pembuat post (sesuaikan nama field di skema Prisma kamu)
                }
            });
            return { data, message: "Posts retrieved successfully" };
        })

        // 3. GET ALL POST LIKES
        .get("/postlike", async () => {
            const data = await getPrisma().postLike.findMany();
            return { data, message: "Post likes retrieved successfully" };
        })

        // 4. GET ALL COMMENTS
        .get("/comment", async () => {
            const data = await getPrisma().comment.findMany();
            return { data, message: "Comments retrieved successfully" };
        })

        // 5. GET ALL NOTIFICATIONS
        .get("/notification", async () => {
            const data = await getPrisma().notification.findMany();
            return { data, message: "Notifications retrieved successfully" };
        });
import type { DbClient } from "../types";
import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";

let Provider: any;

async function initializeDatabase() {
    if (process.env.NODE_ENV === "dev") {
        const { Provider: prof } = await import("../generated/prisma/client");
        Provider = prof;
    } else {
        const { Provider: prof } = await import("../generated/prisma-pg/client");
        Provider = prof;
    }
}

export const authRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: "/auth" })
        .use(
            jwt({
                name: "jwt",
                secret: process.env.JWT_SECRET || "dev",
                exp: "1d",
            })
        )
        // ==========================================
        // 1. ENDPOINT: DAFTAR MANUAL (EMAIL & PASSWORD)
        // ==========================================
        .post('/register', async ({ body, set }) => {
            const { name, username, email, password } = body;

            try {
                // Cek apakah email sudah terdaftar
                const existingEmail = await getPrisma().user.findUnique({ where: { email } });
                if (existingEmail) {
                    set.status = 400;
                    return { success: false, message: "Email sudah digunakan" };
                }

                // Cek apakah username sudah terdaftar
                const existingUsername = await getPrisma().user.findUnique({ where: { username } });
                if (existingUsername) {
                    set.status = 400;
                    return { success: false, message: "Username sudah digunakan" };
                }

                // Hash password menggunakan fitur bawaan Bun (sangat cepat & aman)
                const hashedPassword = await Bun.password.hash(password, {
                    algorithm: 'bcrypt',
                    cost: 10
                });

                await initializeDatabase(); // ambil data provider

                // Simpan ke database
                const newUser = await getPrisma().user.create({
                    data: {
                        name,
                        username: username.toLowerCase(),
                        email: email.toLowerCase(),
                        password: hashedPassword,
                        provider: Provider.email // Sesuai dengan enum di schema.prisma (huruf kecil)
                    }
                });

                return {
                    success: true,
                    message: "Akun berhasil dibuat! Silakan login.",
                    user: { id: newUser.id, name: newUser.name, username: newUser.username }
                };

            } catch (error) {
                set.status = 500;
                return { success: false, message: `Terjadi kesalahan server ${error}` };
            }
        }, {
            // Validasi input body menggunakan TypeBox (Elysia t)
            body: t.Object({
                name: t.String({ minLength: 2 }),
                username: t.String({ minLength: 3 }),
                email: t.String({ format: 'email' }),
                password: t.String({ minLength: 6 })
            })
        })

        // ==========================================
        // 2. ENDPOINT: LOGIN MANUAL
        // ==========================================
        .post('/login', async ({ body, jwt, set }) => {
            const { email, password } = body;

            try {
                // Cari user berdasarkan email
                const user = await getPrisma().user.findUnique({ where: { email } });
                if (!user || !user.password) {
                    set.status = 400;
                    return { success: false, message: "Email atau password salah" };
                }

                // Verifikasi password manual dengan hash di DB
                const isPasswordValid = await Bun.password.verify(password, user.password);
                if (!isPasswordValid) {
                    set.status = 400;
                    return { success: false, message: "Email atau password salah" };
                }

                // Generate JWT Token setelah sukses login
                // Kamu bisa menyelipkan access_token kosong/placeholder agar formatnya sama dengan Google OAuth kamu
                const sessionToken = await jwt.sign({
                    userId: user.id,
                    email: user.email,
                    access_token: "manual_session_token"
                });

                return {
                    success: true,
                    message: "Login berhasil",
                    token: sessionToken,
                    user: {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        avatar_url: user.avatar_url
                    }
                };

            } catch (error) {
                set.status = 500;
                return { success: false, message: "Terjadi kesalahan server" };
            }
        }, {
            body: t.Object({
                email: t.String({ format: 'email' }),
                password: t.String()
            })
        })

        .post("/google", async ({ body, jwt }) => {
            const { access_token } = body;

            // 1. Ambil info user dari Google (Verifikasi Token)
            const resG = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            const googleUser: any = await resG.json();

            if (!googleUser.email) throw new Error("Invalid Google Token");

            // 2. Buat JWT Session
            const sessionToken = await jwt.sign({ googleUser });

            const responseData: any = {
                success: true,
                token: sessionToken
            };

            await initializeDatabase(); // ambil data provider

            const user = await getPrisma().user.upsert({
                where: { email: googleUser.email },
                update: {
                    name: googleUser.name,
                    avatar_url: googleUser.picture,
                },
                create: {
                    name: googleUser.name,
                    email: googleUser.email,
                    username: googleUser.email.split('@')[0] + Math.floor(Math.random() * 1000),
                    avatar_url: googleUser.picture,
                    provider: Provider.google,
                    provider_id: googleUser.id,
                },
            });

            // Jika datanya baru dibuat, nilainya akan sama persis atau selisihnya di bawah 10ms (toleransi eksekusi DB)
            const isNewUser = Math.abs(user.created_at.getTime() - user.updated_at.getTime()) < 10;

            if (isNewUser) {
                responseData.created = true;
            }

            responseData.user = {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                bio: user.bio,
                provider: user.provider,
                created_at: user.created_at,
                updated_at: user.updated_at
            }

            return responseData;
        }, {
            body: t.Object({
                access_token: t.String()
            })
        });
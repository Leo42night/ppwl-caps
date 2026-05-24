import type { DbClient } from "../types";
import { Elysia, t } from "elysia";
import { authMiddleware } from './authMiddleware';
import { deleteS3File, uploadS3File } from "../lib/s3";

export const profileRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: "/profile" })
        .use(authMiddleware)
        // ==========================================
        // 1. ENDPOINT: Update Profile
        // ==========================================
        .put('/:id', async ({ body, params, set }) => {
            const {
                name,
                username,
                email,
                bio,
                image,
                old_password,
                new_password
            } = body;

            let message = "";

            try {
                const userId = Number(params.id);

                // ==============================
                // CHECK USER
                // ==============================
                const user = await getPrisma().user.findUnique({
                    where: {
                        id: userId
                    }
                });

                if (!user) {
                    set.status = 404;

                    return {
                        success: false,
                        message: "User tidak ditemukan"
                    };
                }

                // ==============================
                // CHECK USERNAME DUPLICATE
                // ==============================
                const existingUsername = await getPrisma().user.findFirst({
                    where: {
                        username: username.toLowerCase(),
                        NOT: {
                            id: userId
                        }
                    }
                });

                if (existingUsername) {
                    set.status = 400;

                    return {
                        success: false,
                        message: "Username sudah digunakan"
                    };
                }

                // ==============================
                // CHECK EMAIL DUPLICATE
                // ==============================
                const existingEmail = await getPrisma().user.findFirst({
                    where: {
                        email: email.toLowerCase(),
                        NOT: {
                            id: userId
                        }
                    }
                });

                if (existingEmail) {
                    set.status = 400;

                    return {
                        success: false,
                        message: "Email sudah digunakan"
                    };
                }

                // ==============================
                // HANDLE PASSWORD UPDATE
                // ==============================
                let hashedPassword: string | undefined = undefined;

                if (new_password) {
                    // old password wajib
                    if (!old_password) {
                        set.status = 400;

                        return {
                            success: false,
                            message: "Password lama wajib diisi",
                            property: "/old_password"
                        };
                    }

                    // verify old password
                    const isPasswordValid = await Bun.password.verify(
                        old_password,
                        user.password || ""
                    );

                    if (!isPasswordValid) {
                        set.status = 400;

                        return {
                            success: false,
                            message: "Password lama salah"
                        };
                    }

                    // hash new password (sesuai dengan verify saat login email)
                    hashedPassword = await Bun.password.hash(new_password, {
                        algorithm: "bcrypt",
                        cost: 10
                    });
                    message += " [+NEW PASS]"
                }

                // Handle Profile Update baru
                let new_avatar_url = user.avatar_url;
                if (image) {
                    //  hapus image_url yg lama (yg pakai url s3)
                    if (user.avatar_url) await deleteS3File(user.avatar_url);

                    // upload image yg baru -> image_url
                    new_avatar_url = await uploadS3File(image);
                    message += " [+NEW AVATAR]";
                }

                // ==============================
                // UPDATE USER
                // ==============================
                const updatedUser = await getPrisma().user.update({
                    where: {
                        id: userId
                    },

                    data: {
                        name,
                        username: username.toLowerCase(),
                        email: email.toLowerCase(),
                        bio,
                        avatar_url: new_avatar_url,

                        ...(hashedPassword && {
                            password: hashedPassword
                        })
                    }
                });

                return {
                    success: true,
                    message: "Profile berhasil diperbarui" + message,

                    user: {
                        id: updatedUser.id,
                        name: updatedUser.name,
                        username: updatedUser.username,
                        email: updatedUser.email,
                        avatar_url: updatedUser.avatar_url,
                        bio: updatedUser.bio,
                        updated_at: updatedUser.updated_at
                    }
                };

            } catch (error) {
                console.error(error);

                set.status = 500;

                return {
                    success: false,
                    message: "Terjadi kesalahan server",
                    detail: (error as Error).message
                };
            }

        }, {
            params: t.Object({
                id: t.String()
            }),

            body: t.Object({
                name: t.String({
                    minLength: 2
                }),

                username: t.String({
                    minLength: 3
                }),

                email: t.String({
                    format: "email"
                }),

                bio: t.Optional(t.String()),

                image: t.Optional(t.File()),

                old_password: t.Optional(t.String({
                    minLength: 6
                })),

                new_password: t.Optional(t.String({
                    minLength: 6
                }))
            })
        });
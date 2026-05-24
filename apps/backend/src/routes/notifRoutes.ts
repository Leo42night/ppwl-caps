import { Elysia, t } from 'elysia';
import type { DbClient } from '../types';

export const notifRoutes = (getPrisma: () => DbClient) =>
    new Elysia({ prefix: "/notif" })
        // Menandai SATU notifikasi sebagai dibaca berdasarkan ID Notifikasi
        .patch('/:id/mark-as-read', async ({ params, set }) => {
            try {
                const { id } = params;
                const updatedNotif = await getPrisma().notification.update({
                    where: {
                        id: id
                    },
                    data: {
                        is_read: true
                    }
                });

                return {
                    success: true,
                    message: "Notifikasi berhasil ditandai sebagai dibaca",
                    data: updatedNotif
                };

            } catch (err) {
                set.status = 500;

                return {
                    success: false,
                    message: (err as Error).message,
                }
            }
        }, {
            params: t.Object({
                id: t.Numeric()
            })
        })
        .patch('/mark-all-read/:userId', async ({ params, set }) => {
            try {
                const { userId } = params;

                // Melakukan update massal untuk notifikasi yang is_read nya masih false
                const updateResult = await getPrisma().notification.updateMany({
                    where: {
                        user_id: userId,
                        is_read: false
                    },
                    data: {
                        is_read: true
                    }
                });

                return {
                    success: true,
                    message: `Berhasil menandai ${updateResult.count} notifikasi sebagai dibaca`
                };

            } catch (err) {
                set.status = 500;

                return {
                    success: false,
                    message: (err as Error).message,
                }
            }
        }, {
            params: t.Object({
                userId: t.Numeric({ error: "User ID harus berupa angka" })
            })
        });
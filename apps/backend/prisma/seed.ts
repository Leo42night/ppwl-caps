let prisma: any;
let Provider: any;
let NotificationType: any;

async function initializeDatabase() {
  if (process.env.NODE_ENV === "dev") {
    const { getPrisma: localDb, dbUrl } = await import("./db");
    const { Provider: prof, NotificationType: nof } = await import("../src/generated/prisma/client");
    Provider = prof;
    NotificationType = nof;
    prisma = localDb();
    console.log("dbUrl", dbUrl);
  } else {
    const { getPrisma: prodDb } = await import("./dbPostgres");
    const { Provider: prof, NotificationType: nof } = await import("../src/generated/prisma-pg/client");
    Provider = prof;
    NotificationType = nof;
    prisma = prodDb();
  }
}

async function main() {
  await initializeDatabase();
  console.log("Memulai proses seeding data dummy...");

  await prisma.notification.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.postLike.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});


  // =========================
  // USERS
  // =========================
  const userA = await prisma.user.create({
    data: {
      name: "User A",
      username: "usera",
      email: "a@mail.com",
      password: "hashed_password",
      provider: Provider.email,
    },
  });

  const userB = await prisma.user.create({
    data: {
      name: "User B",
      username: "userb",
      email: "b@mail.com",
      password: "hashed_password",
      provider: Provider.email,
    },
  });

  const userC = await prisma.user.create({
    data: {
      name: "User C",
      username: "userc",
      email: "c@mail.com",
      password: "hashed_password",
      provider: Provider.google,
      provider_id: "google-123",
    },
  });

  // =========================
  // POSTS
  // =========================
  const post1 = await prisma.post.create({
    data: {
      user_id: userA.id,
      content: "Hello world dari User A",
      image_url: null,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      user_id: userB.id,
      content: "Post pertama User B",
      image_url: "https://example.com/image.jpg",
    },
  });

  // =========================
  // POST LIKES (DIPERBAIKI)
  // =========================
  const likesData = [
    { post_id: post1.id, user_id: userB.id },
    { post_id: post1.id, user_id: userC.id },
    { post_id: post2.id, user_id: userA.id },
  ];

  // Menggunakan perulangan manual agar kompatibel dengan SQLite lokal
  for (const like of likesData) {
    try {
      await prisma.postLike.create({
        data: like,
      });
    } catch (error: any) {
      // Mengabaikan error jika data sudah ada (P2002: Unique constraint failed)
      if (error.code !== "P2002") {
        throw error;
      }
    }
  }

  // =========================
  // COMMENTS
  // =========================
  const comment1 = await prisma.comment.create({
    data: {
      post_id: post1.id,
      user_id: userB.id,
      content: "Nice post!",
    },
  });

  await prisma.comment.create({
    data: {
      post_id: post1.id,
      user_id: userA.id,
      parent_comment_id: comment1.id,
      content: "Thanks!",
    },
  });

  // =========================
  // NOTIFICATIONS
  // =========================
  await prisma.notification.createMany({
    data: [
      {
        user_id: userA.id, // penerima
        actor_id: userB.id,
        type: NotificationType.like,
        post_id: post1.id,
        is_read: false,
      },
      {
        user_id: userA.id,
        actor_id: userB.id,
        type: NotificationType.comment,
        post_id: post1.id,
        comment_id: comment1.id,
        is_read: false,
      },
      {
        user_id: userB.id,
        actor_id: userA.id,
        type: NotificationType.comment,
        post_id: post2.id,
        is_read: false,
      },
    ],
  });

  console.log("Seeding selesai 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

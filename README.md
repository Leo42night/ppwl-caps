# ppwl caps
Tutor by Leo (asdos), buat cth bikin proyek nya. base proyek PPWL11
```sh
# masukkan skema yg baru ke *.schema
# hapus dev.db & migrations/*.sql
cd apps/backend
bun prisma migrate dev --name init
bun prisma generate
bun prisma db seed
# koneksi `dev.db` ke HeidiSQL Sqlite, lihat isinya
# buat database AWS, koneksi ke heidiSql, run skema pg baru
bun prisma generate --schema prisma/schema-postgres.prisma
# Isi backend/package.json script "bun --env-file=.env.production prisma/seed.ts", pastikan DATABASE_URL postgres di `.env.production` ada)
bun seed:pg
# lihat isinya di heidiSQL koneksi Postgres
```
Jika tidak ada HeidiSQL, SQlite database bisa dikelola pakai [SQLite3](#sqlite3), Postgres bisa pakai `pgsql CLI`.

## SQLite3
Untuk kelola database sqlite (dev).

### 1. Instalasi
*   **Windows**: Unduh **sqlite-tools** dari [sqlite.org](https://sqlite.org). Ekstrak file `.exe` ke sebuah folder (misal `C:\sqlite`), lalu daftarkan folder tersebut ke **Environment Variables (PATH)** sistem Anda.
*   **macOS**: Jalankan `brew install sqlite` via Homebrew (atau gunakan versi bawaan mac).
*   **Linux (Ubuntu/Debian)**: Jalankan `sudo apt update && sudo apt install sqlite3`.

### 2. Membuka Database & Mengatur Format
Masuk ke direktori tempat database berada melalui terminal, lalu jalankan perintah berikut:
```bash
sqlite3 dev.db
```
Setelah masuk ke *prompt* `sqlite>`, ketik dua perintah ini agar tampilan data rapi berbentuk tabel:
```sqlite
.mode table
.headers on
```

### 3. Perintah Navigasi Utama
*   **Melihat daftar tabel:** `.tables`
*   **Melihat skema/struktur tabel:** `.schema nama_tabel`
*   **Keluar dari aplikasi:** `.exit`

### 4. Contoh Query SQL Populer
*   **Lihat seluruh isi data:** `SELECT * FROM Feedback;`
*   **Lihat 5 data terbaru:** `SELECT * FROM RecomTarget ORDER BY createdAt DESC LIMIT 5;`
*   **Hapus semua isi tabel:** `DELETE FROM Score;`


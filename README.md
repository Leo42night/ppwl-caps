# PPWL Capstone Project
Tutor by Leo (*Asdos*), Ex. Base Logic Code for Caps Project. Base on PPWL11's Project

## Setup Database
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

## Code
- fungsi `elysiaErr()` untuk debug console, tidak masalah ke logika kode jika dihapus.

## Tutor AWS S3 Bucket untuk Host Image
```sh
S3 → Create bucket
  Region: us-east-1
  Bucket name: ppwl-caps-img (ini contoh saja, harus globally unique)
  Block all public access: OFF (kita perlu public baca)
  Centang "I acknowledge that the current ... becoming public."
  
→ Setelah bucket dibuat, beri akses global (supaya url dapat di-request di browser/app):
  → <dalam bucked> tab Permissions → Bucket Policy → edit (cth ada di bawah):
    -> Add New Statement -> Choose a service "S3"
    -> Search action "GetObject"
    -> Add Resource 
        -> Service S3
        -> Type "object"
        -> Resource ARN "arn:aws:s3:::ppwl-caps-img/*" 
    -> edit JSON "Principal": "*" 
```

<details><summary>Contoh Bucket Policy</summary>

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "Statement1",
			"Principal": "*",
			"Effect": "Allow",
			"Action": [
				"s3:GetObject"
			],
			"Resource": [
				"arn:aws:s3:::ppwl-caps-img/*"
			]
		}
	]
}
```
</details>

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
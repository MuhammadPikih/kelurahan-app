-- AlterTable
ALTER TABLE "Surat" ADD COLUMN "userId" INTEGER;

-- CreateTable
CREATE TABLE "Pengaduan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'lainnya',
    "status" TEXT NOT NULL DEFAULT 'menunggu',
    "userId" INTEGER NOT NULL,
    "namaWarga" TEXT NOT NULL DEFAULT '',
    "alamat" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

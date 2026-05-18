-- CreateTable
CREATE TABLE "Berita" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'pengumuman',
    "foto" TEXT,
    "penulisId" INTEGER NOT NULL,
    "penulis" TEXT NOT NULL DEFAULT '',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

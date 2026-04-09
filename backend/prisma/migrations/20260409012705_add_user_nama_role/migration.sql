-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "nama" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Penduduk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" DATETIME NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "agama" TEXT NOT NULL,
    "statusKawin" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL DEFAULT 'Kelurahan Contoh',
    "kecamatan" TEXT NOT NULL DEFAULT 'Kecamatan Contoh',
    "kota" TEXT NOT NULL DEFAULT 'Kota Contoh',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Surat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomorSurat" TEXT NOT NULL,
    "jenisSurat" TEXT NOT NULL,
    "keperluan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pendudukId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Surat_pendudukId_fkey" FOREIGN KEY ("pendudukId") REFERENCES "Penduduk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Penduduk_nik_key" ON "Penduduk"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Surat_nomorSurat_key" ON "Surat"("nomorSurat");

import React, { useEffect, useState } from 'react'

/*
  Komponen Modal yang bisa dipakai ulang di mana saja.
  Props yang diterima:
  - title   : judul modal
  - onClose : fungsi yang dipanggil saat modal ditutup
  - children: konten di dalam modal (form, teks, dll)
*/
export default function Modal({ title, onClose, children }) {
  /*
    State "visible" dipakai untuk mengontrol animasi.
    Saat modal pertama dibuka, visible = false dulu,
    lalu langsung diubah ke true agar animasi "masuk" berjalan.
  */
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    /*
      setTimeout 10ms memberi waktu browser untuk merender
      elemen dulu sebelum animasi dimulai.
      Tanpa ini, animasi kadang tidak terlihat.
    */
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  /*
    Fungsi close dengan animasi keluar.
    Kita set visible = false dulu (animasi keluar),
    lalu tunggu 250ms baru panggil onClose() untuk unmount komponen.
  */
  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  return (
    /*
      Overlay gelap di belakang modal.
      Opacity berubah berdasarkan state "visible".
      "transition-opacity duration-250" membuat perubahan halus.
    */
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-250 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleClose} /* klik di luar modal = tutup */
    >
      {/*
        Kotak modal itu sendiri.
        "scale" berubah dari 95% ke 100% saat muncul,
        menciptakan efek "pop" yang menarik.
        "stopPropagation" mencegah klik di dalam modal
        meneruskan event ke overlay (yang akan menutup modal).
      */}
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto
          transition-all duration-250
          ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header modal: judul + tombol tutup */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
          <button
            onClick={handleClose}
            /*
              Tombol X berputar 90 derajat saat di-hover
              menggunakan "hover:rotate-90".
            */
            className="text-gray-400 hover:text-gray-600 text-xl transition-transform duration-200 hover:rotate-90"
          >
            ✕
          </button>
        </div>

        {/* Konten modal */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

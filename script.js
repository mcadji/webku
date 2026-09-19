/* ==========================================================
   Portofolio - script.js
   1. Mode terang / gelap
   2. Saring proyek
   3. Menu aktif saat halaman digulir
   4. Validasi formulir kontak
   5. Tahun otomatis di kaki halaman
   ========================================================== */

(function () {
  "use strict";

  const root = document.documentElement;

  /* ---------- 1. Mode terang / gelap ---------- */
  const tombolTema = document.getElementById("tombolTema");
  const kunciTema = "tema-portofolio";

  function temaSistem() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "gelap" : "terang";
  }

  function temaSaatIni() {
    return root.dataset.tema || temaSistem();
  }

  function perbaruiTombol() {
    tombolTema.textContent = temaSaatIni() === "gelap" ? "Mode terang" : "Mode gelap";
  }

  function terapkanTema(tema) {
    root.dataset.tema = tema;
    perbaruiTombol();
  }

  try {
    const tersimpan = localStorage.getItem(kunciTema);
    if (tersimpan === "gelap" || tersimpan === "terang") {
      root.dataset.tema = tersimpan;
    }
  } catch (e) {
    /* penyimpanan tidak tersedia, abaikan */
  }
  perbaruiTombol();

  tombolTema.addEventListener("click", function () {
    const berikutnya = temaSaatIni() === "gelap" ? "terang" : "gelap";
    terapkanTema(berikutnya);
    try {
      localStorage.setItem(kunciTema, berikutnya);
    } catch (e) {
      /* abaikan */
    }
  });

  /* ---------- 2. Saring proyek ---------- */
  const tombolSaring = document.querySelectorAll(".saring-tombol");
  const itemProyek = document.querySelectorAll("#daftarProyek .proyek");
  const teksJumlah = document.getElementById("jumlahProyek");

  function saringProyek(kategori) {
    let tampil = 0;

    itemProyek.forEach(function (item) {
      const cocok = kategori === "semua" || item.dataset.kategori === kategori;
      item.hidden = !cocok;
      if (cocok) tampil++;
    });

    tombolSaring.forEach(function (tombol) {
      tombol.setAttribute("aria-pressed", String(tombol.dataset.saring === kategori));
    });

    teksJumlah.textContent = "Menampilkan " + tampil + " proyek";
  }

  tombolSaring.forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      saringProyek(tombol.dataset.saring);
    });
  });

  /* ---------- 3. Menu aktif saat digulir ---------- */
  const tautanMenu = document.querySelectorAll(".menu a");
  const bagian = document.querySelectorAll("main .bagian");

  function tandaiMenu(id) {
    tautanMenu.forEach(function (tautan) {
      const aktif = tautan.dataset.bagian === id;
      tautan.classList.toggle("aktif", aktif);
      if (aktif) {
        tautan.setAttribute("aria-current", "true");
      } else {
        tautan.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const pengamat = new IntersectionObserver(
      function (entri) {
        entri.forEach(function (e) {
          if (e.isIntersecting) tandaiMenu(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    bagian.forEach(function (b) {
      pengamat.observe(b);
    });
  }
  tandaiMenu("tentang");

  /* ---------- 4. Validasi formulir kontak ---------- */
  const form = document.getElementById("formKontak");
  const status = document.getElementById("statusForm");

  const aturan = [
    {
      input: document.getElementById("fNama"),
      galat: document.getElementById("galatNama"),
      periksa: function (v) {
        if (v.trim().length < 2) return "Tulis nama Anda, minimal 2 huruf.";
        return "";
      },
    },
    {
      input: document.getElementById("fEmail"),
      galat: document.getElementById("galatEmail"),
      periksa: function (v) {
        if (!v.trim()) return "Tulis alamat email Anda.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) {
          return "Format email belum benar. Contoh: nama@contoh.com";
        }
        return "";
      },
    },
    {
      input: document.getElementById("fPesan"),
      galat: document.getElementById("galatPesan"),
      periksa: function (v) {
        if (v.trim().length < 10) return "Pesan terlalu singkat, tulis minimal 10 karakter.";
        return "";
      },
    },
  ];

  function periksaSatu(a) {
    const pesan = a.periksa(a.input.value);
    a.galat.textContent = pesan;
    a.input.closest(".baris-form").classList.toggle("bermasalah", pesan !== "");
    a.input.setAttribute("aria-invalid", pesan !== "" ? "true" : "false");
    if (pesan) {
      a.input.setAttribute("aria-describedby", a.galat.id);
    } else {
      a.input.removeAttribute("aria-describedby");
    }
    return pesan === "";
  }

  aturan.forEach(function (a) {
    /* Periksa ulang saat pengguna pindah kolom, dan saat mengetik jika sudah ada galat */
    a.input.addEventListener("blur", function () {
      if (a.input.value !== "") periksaSatu(a);
    });
    a.input.addEventListener("input", function () {
      if (a.galat.textContent) periksaSatu(a);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";

    let semuaBenar = true;
    let kolomPertamaSalah = null;

    aturan.forEach(function (a) {
      const benar = periksaSatu(a);
      if (!benar && !kolomPertamaSalah) kolomPertamaSalah = a.input;
      semuaBenar = semuaBenar && benar;
    });

    if (!semuaBenar) {
      kolomPertamaSalah.focus();
      return;
    }

    /* ------------------------------------------------------
       Di sini pesan belum benar-benar terkirim karena belum ada server.
       Untuk mengirim sungguhan, gunakan salah satu cara ini:
       - Layanan formulir seperti Formspree atau Getform (ganti action pada <form>)
       - fetch() ke backend Anda sendiri
       ------------------------------------------------------ */
    status.textContent = "Terima kasih, pesan Anda sudah dicatat. Saya akan membalas lewat email.";
    form.reset();
  });

  /* ---------- 5. Tahun otomatis ---------- */
  const tahun = document.getElementById("tahunIni");
  if (tahun) tahun.textContent = new Date().getFullYear();
})();

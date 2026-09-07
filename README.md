# 🛠️ SIPD-RI Chrome Extension

> **Ekstensi Google Chrome** untuk mengoptimalkan dan mempercepat pekerjaan di aplikasi **[SIPD-RI Kemendagri](https://sipd-ri.kemendagri.go.id)** — sinkronisasi data ke database lokal, export RKA, manajemen pengguna, dan masih banyak lagi.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Persyaratan](#-persyaratan)
- [Cara Instalasi](#-cara-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Grup & Komunitas](#-grup--komunitas)
- [Donasi](#-donasi)
- [Video Tutorial](#-video-tutorial)

---

## ✨ Fitur Utama

### 🔐 Login & Sesi
| Fitur | Keterangan |
|---|---|
| Tampil Password | Checkbox "Tampilkan password" di halaman login |
| Jaga Sesi Aktif | Interval request otomatis ke server agar sesi login tidak expired |

---

### 📦 Sinkronisasi Data Master
| Fitur | Keterangan |
|---|---|
| Export Data SSH (Standar Satuan Harga) | Sinkron data SSH, HSPK, ASB, SBU ke database lokal |
| Export Akun Belanja | Sinkron seluruh rekening akun belanja ke database lokal |
| Export SKPD | Sinkron data profil seluruh Perangkat Daerah ke database lokal |
| Export Sub Kegiatan | Sinkron data program/kegiatan/sub kegiatan ke database lokal |
| Export Master SPM | Sinkron data Standar Pelayanan Minimal ke database lokal |
| Export Sumber Dana | Sinkron data master sumber dana ke database lokal |
| Update Status Non-Aktif | Otomatis memperbarui status sub kegiatan yang dihapus di SIPD menjadi non-aktif di database lokal |

---

### 📊 Sinkronisasi Data RKA & Anggaran
| Fitur | Keterangan |
|---|---|
| Export RKA Satu Perangkat Daerah | Export RKA per SKPD ke database lokal |
| Export RKA Seluruh Perangkat Daerah | Export RKA semua SKPD sekaligus ke database lokal |
| Export Program Kegiatan | Sinkron data program dan kegiatan ke database lokal |
| Export Data SPM | Sinkron data SPM ke database lokal |
| Export Mapping Subgiat SPM | Sinkron data mapping sub kegiatan terhadap SPM ke database lokal |

---

### 📝 Usulan & Kamus
| Fitur | Keterangan |
|---|---|
| Export Kamus Usulan ASMAS | Sinkron kamus usulan Aspirasi Masyarakat ke database lokal |
| Export Kamus Usulan POKIR | Sinkron kamus usulan Pokok-Pokok Pikiran DPRD ke database lokal |
| Export Data Usulan ASMAS | Sinkron data usulan Aspirasi Masyarakat ke database lokal |
| Export Data Usulan POKIR | Sinkron data usulan Pokok-Pokok Pikiran DPRD ke database lokal |
| Hapus Arsip Standar Harga | Menghapus arsip standar harga yang tidak diperlukan |

---

### 👥 Sinkronisasi Data Pengguna
| Fitur | Keterangan |
|---|---|
| Export User Kelurahan/Desa | Sinkron data akun pengguna tingkat kelurahan/desa ke database lokal |
| Export User Anggota Dewan | Sinkron data akun anggota DPRD ke database lokal |
| Export User SKPD | Sinkron data akun pengguna Perangkat Daerah ke database lokal |
| Export User Mitra/Penyelia | Sinkron data akun pengguna Mitra dan Penyelia ke database lokal |

---

## 🔧 Persyaratan

- Google Chrome / Chromium (Manifest V3)
- Server WordPress lokal dengan plugin **[WP-SIPD](https://wpsipd.baktinegara.co.id/)** yang sudah terpasang
- API Key aktif dari [wpsipd.baktinegara.co.id](https://wpsipd.baktinegara.co.id/)

---

## 🚀 Cara Instalasi

1. **Download** repository ini (klik tombol *Code → Download ZIP*) atau clone:
   ```bash
   git clone https://github.com/your-username/sipd-ri-chrome-extension.git
   ```
2. Buka Chrome dan masuk ke **`chrome://extensions/`**
3. Aktifkan **Developer Mode** (pojok kanan atas)
4. Klik **"Load unpacked"** dan pilih folder hasil download/clone
5. Salin file konfigurasi:
   ```bash
   cp config.js.example config.js
   ```
6. Isi `config.js` sesuai dengan pengaturan server Anda (lihat bagian [Konfigurasi](#-konfigurasi))
7. Reload ekstensi di `chrome://extensions/`

---

## ⚙️ Konfigurasi

Salin `config.js.example` menjadi `config.js`, lalu sesuaikan nilainya:

```js
const config = {
    sipd_url          : "https://sipd-ri.kemendagri.go.id/",   // URL SIPD-RI (jangan diubah)
    url_server_lokal  : "https://example.com/wp-admin/admin-ajax.php", // URL server WordPress WP-SIPD Anda
    api_key           : "xxxxxxxxxxxxxxxxxxxx",                 // API Key dari wpsipd.baktinegara.co.id
    id_daerah         : 0,                                      // ID Daerah sesuai SIPD
    no_detail_rincian : false
};
```

> ℹ️ Informasi cara mendapatkan API Key dan cara aktivasi lisensi tersedia di **[wpsipd.baktinegara.co.id](https://wpsipd.baktinegara.co.id/)**

---

## 💬 Grup & Komunitas

Bergabunglah di grup Telegram untuk diskusi, update, dan bantuan teknis:

👉 **[t.me/sipd_chrome_extension](https://t.me/sipd_chrome_extension)**

---

## ❤️ Donasi

Ekstensi ini dikembangkan secara sukarela. Dukung pengembangan dengan berdonasi:

- 🏫 **SMK Asiyah Homeschooling** — [smkasiyahhomeschooling.blogspot.com/.../donasi](https://smkasiyahhomeschooling.blogspot.com/p/donasi-pengembangan-smk-asiyah.html)
- 🕌 **Donasi Qodr** — [donasi.qodr.or.id](https://donasi.qodr.or.id/)

Semoga bermanfaat dan menjadi amal jariyah. 🙏

---

## 🎬 Video Tutorial

> *Coming soon...*

---

## 📄 Lisensi

Proyek ini bersifat *open source* untuk keperluan internal pemerintah daerah. Penggunaan di luar konteks tersebut harap menghubungi pengembang melalui grup Telegram.

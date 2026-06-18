import { NavbarLayout } from "@/components/layouts/NavbarLayout";

const storeNavItems = [
  { label: "Beranda", href: "/" },
  { label: "Katalog", href: "/#produk" },
];

export default function PengembalianPage() {
  return (
    <NavbarLayout navItems={storeNavItems}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Kebijakan Pengembalian (Return Policy)</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--brand-border)] prose max-w-none">
          <p className="mb-4">Kami menerima pengembalian barang jika terjadi kesalahan dari pihak kami atau cacat pada produk. Untuk memastikan proses retur berjalan lancar, mohon perhatikan kebijakan berikut:</p>

          <h2 className="text-xl font-semibold mb-4 text-[var(--brand-black)]">1. Syarat Pengembalian (Retur)</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Batas Waktu:</strong> Pengajuan retur hanya dapat dilakukan maksimal <strong>1x24 jam</strong> setelah pesanan diterima (status pesanan SELESAI). Setelah lewat dari waktu tersebut, tombol retur akan otomatis hilang.</li>
            <li>Barang yang dikembalikan harus dalam kondisi sama seperti saat diterima (belum dipakai, dicuci, dan label/tag masih menempel).</li>
            <li>Barang yang dikirim salah (salah ukuran, variasi, atau model yang tidak sesuai pesanan).</li>
            <li>Produk dalam kondisi rusak atau cacat produksi.</li>
            <li><strong>Tag/label pakaian masih terpasang utuh dan barang belum pernah dipakai, dicuci, atau disetrika.</strong></li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
            <p className="font-semibold text-yellow-800 m-0">Wajib Video Unboxing</p>
            <p className="text-yellow-700 m-0 mt-2">
              Segala bentuk komplain dan pengembalian <strong>wajib disertai Video Unboxing</strong> tanpa jeda (no pause) sejak paket belum dibuka sama sekali. 
              Tanpa video unboxing, mohon maaf komplain tidak dapat kami terima.
            </p>
          </div>

          <h3>Cara Mengajukan Pengembalian</h3>
          <ol>
            <li>Masuk ke akun Anda dan pilih menu <strong>Profil &gt; Riwayat Pesanan</strong>.</li>
            <li>Pilih pesanan yang bermasalah, lalu klik tombol <strong>"Ajukan Pengembalian"</strong>.</li>
            <li>Isi alasan pengembalian dan unggah <strong>Foto Bukti</strong> dari barang yang cacat atau salah kirim.</li>
            <li>Tunggu persetujuan awal dari Admin (maks. 1x24 jam).</li>
            <li>Kirimkan <strong>Video Unboxing</strong> ke nomor WhatsApp Admin untuk validasi akhir.</li>
          </ol>
        </div>
      </div>
    </NavbarLayout>
  );
}

import { NavbarLayout } from "@/components/layouts/NavbarLayout";

const storeNavItems = [
  { label: "Beranda", href: "/" },
  { label: "Katalog", href: "/#produk" },
];

export default function PengirimanPage() {
  return (
    <NavbarLayout navItems={storeNavItems}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Informasi Pengiriman</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--brand-border)] prose max-w-none">
          <h3>Jadwal Pengiriman</h3>
          <p>
            Pesanan yang masuk dan telah dikonfirmasi pembayarannya sebelum pukul 15.00 WIB akan diproses dan dikirim pada hari yang sama. 
            Pesanan yang masuk setelah pukul 15.00 WIB akan diproses pada hari kerja berikutnya.
          </p>
          <p>
            Hari operasional pengiriman kami adalah <strong>Senin - Sabtu</strong>. Kami tidak melakukan pengiriman pada hari Minggu dan Hari Libur Nasional.
          </p>

          <h3>Estimasi Waktu Pengiriman</h3>
          <ul>
            <li><strong>Pulau Jawa:</strong> 1-3 hari kerja</li>
            <li><strong>Luar Pulau Jawa:</strong> 3-7 hari kerja</li>
            <li><strong>Area Terpencil:</strong> 7-14 hari kerja</li>
          </ul>

          <h3>Layanan Ekspedisi</h3>
          <p>
            Saat ini Manola bekerja sama dengan kurir terpercaya seperti JNE, J&T, Sicepat, dan Anteraja untuk memastikan paket Anda tiba dengan aman. 
            Nomor resi akan otomatis masuk ke akun Anda setelah pesanan dikirim.
          </p>
        </div>
      </div>
    </NavbarLayout>
  );
}

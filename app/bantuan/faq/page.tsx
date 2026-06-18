import { NavbarLayout } from "@/components/layouts/NavbarLayout";

const storeNavItems = [
  { label: "Beranda", href: "/" },
  { label: "Katalog", href: "/#produk" },
];

export default function FAQPage() {
  const faqs = [
    {
      q: "Bagaimana cara melacak pesanan?",
      a: "Anda dapat melacak pesanan dengan masuk ke akun Anda, klik menu Profil, lalu pilih tab 'Riwayat Pesanan'. Di sana Anda akan melihat status pesanan beserta nomor resi pengiriman."
    },
    {
      q: "Berapa lama proses pengiriman?",
      a: "Pengiriman biasanya memakan waktu 2-3 hari kerja untuk area pulau Jawa, dan 4-7 hari kerja untuk luar pulau Jawa."
    },
    {
      q: "Apakah barang yang sudah dibeli bisa dikembalikan?",
      a: "Ya, Anda bisa mengembalikan barang jika tidak sesuai pesanan atau cacat produksi. Pengajuan pengembalian (retur) hanya dapat dilakukan maksimal 1x24 jam setelah pesanan diterima (status pesanan menjadi SELESAI). Silakan cek Kebijakan Pengembalian kami untuk syarat dan langkah-langkah detailnya."
    },
    {
      q: "Apakah saya bisa membatalkan pesanan?",
      a: "Pesanan yang belum dibayar dapat dibatalkan. Namun, jika pesanan sudah dibayar dan berstatus 'Diproses' atau 'Dikemas', pesanan tidak dapat dibatalkan karena sudah masuk ke sistem pergudangan kami."
    }
  ];

  return (
    <NavbarLayout navItems={storeNavItems}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions (FAQ)</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-[var(--brand-border)]">
              <h3 className="text-lg font-semibold text-[var(--brand-black)] mb-2">{faq.q}</h3>
              <p className="text-[var(--brand-muted)]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </NavbarLayout>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MInput } from "@/components/manola/MInput";
import { authService } from "@/lib/services";
import { ApiError } from "@/lib/api";

// Role → redirect map
const ROLE_REDIRECT: Record<string, string> = {
  OWNER: "/owner/dashboard",
  ADMIN: "/admin/dashboard",
  KASIR: "/kasir/dashboard",
  PACKAGING: "/packaging/dashboard",
  USER: "/",
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // ── LOGIN ─────────────────────────────────────────────────────────────
      const response = await authService.login(formData.email, formData.password);

      // Ambil pesan sukses dari response (jika ada, default: "Login berhasil")
      setSuccessMsg(response.message || "Login berhasil!");

      const { user } = response;
      const redirect = ROLE_REDIRECT[user.role] ?? "/";

      // Beri sedikit waktu untuk melihat pesan sukses sebelum redirect
      setTimeout(() => {
        router.push(redirect);
      }, 800);

    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-gray)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--brand-white)] border-b border-[var(--brand-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link href="/" className="text-2xl font-bold text-[var(--brand-black)]">MANOLA</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[var(--brand-white)] rounded-2xl border border-[var(--brand-border)] p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[var(--brand-black)]">
                Masuk ke Akun
              </h1>
              <p className="text-[var(--brand-muted)] mt-2">
                Selamat datang kembali!
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Success message */}
            {successMsg && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-green-50 text-green-700 border border-green-200">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <MInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                required
              />
              <div className="relative">
                <MInput
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-[var(--brand-muted)] hover:text-[var(--brand-black)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <MButton type="submit" className="w-full mt-6" size="lg" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </MButton>
            </form>
          </div>

          <p className="text-center text-sm text-[var(--brand-muted)] mt-6">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link href="#" className="underline hover:text-[var(--brand-black)]">Syarat &amp; Ketentuan</Link>{" "}
            dan{" "}
            <Link href="#" className="underline hover:text-[var(--brand-black)]">Kebijakan Privasi</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

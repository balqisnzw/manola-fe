"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MInput } from "@/components/manola/MInput";
import { MButton } from "@/components/manola/MButton";
import { authService } from "@/lib/services/authService";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!token) {
      setError("Token reset password tidak valid atau hilang.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccessMsg("Password berhasil diubah! Anda akan diarahkan ke halaman login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Gagal mengubah password. Link mungkin sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[var(--brand-white)] rounded-2xl border border-[var(--brand-border)] p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--brand-black)]">Buat Password Baru</h1>
          <p className="text-[var(--brand-muted)] mt-2">
            Silakan masukkan password baru untuk akun Manola Anda
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-green-50 text-green-700 border border-green-200">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <MInput
              label="Password Baru"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-[var(--brand-muted)] hover:text-[var(--brand-black)]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <MInput
              label="Konfirmasi Password Baru"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-[var(--brand-muted)] hover:text-[var(--brand-black)]"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <MButton type="submit" className="w-full mt-2" size="lg" disabled={loading}>
            {loading ? "Memproses..." : "Simpan Password Baru"}
          </MButton>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-[var(--brand-black)] font-medium hover:underline">
            Kembali ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-gray)] flex flex-col">
      <header className="bg-[var(--brand-white)] border-b border-[var(--brand-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link href="/" className="text-2xl font-bold text-[var(--brand-black)]">MANOLA</Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}

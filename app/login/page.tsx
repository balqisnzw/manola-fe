"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MInput } from "@/components/manola/MInput";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/profil");
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
                {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
              </h1>
              <p className="text-[var(--brand-muted)] mt-2">
                {isLogin ? "Selamat datang kembali!" : "Bergabung dengan Manola hari ini"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <MInput
                  label="Nama Lengkap"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              )}
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
              {!isLogin && (
                <MInput
                  label="Konfirmasi Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Ulangi password"
                  required
                />
              )}
              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-[var(--brand-muted)] hover:text-[var(--brand-black)]">
                    Lupa password?
                  </button>
                </div>
              )}
              <MButton type="submit" className="w-full" size="lg">
                {isLogin ? "Masuk" : "Daftar"}
              </MButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--brand-muted)]">
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-[var(--brand-black)] hover:underline"
                >
                  {isLogin ? "Daftar sekarang" : "Masuk"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-[var(--brand-muted)] mt-6">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link href="#" className="underline hover:text-[var(--brand-black)]">Syarat & Ketentuan</Link>{" "}
            dan{" "}
            <Link href="#" className="underline hover:text-[var(--brand-black)]">Kebijakan Privasi</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

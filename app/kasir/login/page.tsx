"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MInput } from "@/components/manola/MInput"
import { MButton } from "@/components/manola/MButton"

export default function KasirLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      router.push("/kasir/transaksi")
    }, 500)
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen flex items-center justify-center">
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-bold tracking-widest text-lg text-[#0A0A0A]">MANOLA</h1>
          <p className="text-sm text-[#6B7280] mt-1">Kasir Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MInput
            label="Email"
            type="email"
            placeholder="kasir@manola.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <MInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle
            required
          />
          <MButton type="submit" variant="primary" fullWidth className="mt-4" disabled={isLoading}>
            {isLoading ? "Memuat..." : "Masuk"}
          </MButton>
        </form>
      </div>
    </div>
  )
}

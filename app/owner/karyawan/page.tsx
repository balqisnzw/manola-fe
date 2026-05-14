"use client"

import { useState } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { MBadge } from "@/components/manola/MBadge"
import { LayoutDashboard, Users, UserCog, Settings } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Pengaturan", href: "/owner/pengaturan", icon: Settings },
]

const initialEmployees = [
  { id: 1, name: "Rina Dewi", email: "rina.dewi@manola.com", role: "Admin", createdAt: "10 Jan 2024" },
  { id: 2, name: "Andi Pratama", email: "andi.p@manola.com", role: "Admin", createdAt: "15 Jan 2024" },
  { id: 3, name: "Maya Sari", email: "maya.s@manola.com", role: "Kasir", createdAt: "20 Jan 2024" },
  { id: 4, name: "Dedi Kurniawan", email: "dedi.k@manola.com", role: "Kasir", createdAt: "25 Jan 2024" },
  { id: 5, name: "Lisa Permata", email: "lisa.p@manola.com", role: "Packaging", createdAt: "1 Feb 2024" },
  { id: 6, name: "Rudi Hermawan", email: "rudi.h@manola.com", role: "Packaging", createdAt: "5 Feb 2024" },
]

export default function OwnerKaryawanPage() {
  const [employees, setEmployees] = useState(initialEmployees)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Admin",
  })

  const handleAddEmployee = () => {
    const newEmployee = {
      id: employees.length + 1,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    }
    setEmployees([...employees, newEmployee])
    setShowAddModal(false)
    setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "Admin" })
  }

  const handleDeleteEmployee = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter((e) => e.id !== selectedEmployee.id))
      setShowDeleteModal(false)
      setSelectedEmployee(null)
    }
  }

  const columns = [
    { key: "name", label: "Nama", render: (item: typeof employees[0]) => <span className="font-medium">{item.name}</span> },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (item: typeof employees[0]) => (
        <MBadge
          variant={
            item.role === "Admin"
              ? "info"
              : item.role === "Kasir"
              ? "warning"
              : "gray"
          }
        >
          {item.role}
        </MBadge>
      ),
    },
    { key: "createdAt", label: "Tanggal Dibuat" },
    {
      key: "action",
      label: "Aksi",
      render: (item: typeof employees[0]) => (
        <MButton
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => {
            setSelectedEmployee(item)
            setShowDeleteModal(true)
          }}
        >
          Hapus
        </MButton>
      ),
    },
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Budi Santoso" userRole="Owner">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Karyawan</h1>
        <MButton variant="primary" onClick={() => setShowAddModal(true)}>
          + Tambah Karyawan
        </MButton>
      </div>

      <MCard padding="sm">
        <MTable columns={columns} data={employees} />
      </MCard>

      {/* Add Employee Modal */}
      <MModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Akun Karyawan"
        maxWidth="md"
        footer={
          <>
            <MButton variant="ghost" onClick={() => setShowAddModal(false)}>
              Batal
            </MButton>
            <MButton variant="primary" onClick={handleAddEmployee}>
              Simpan
            </MButton>
          </>
        }
      >
        <div className="space-y-4">
          <MInput
            label="Nama Lengkap"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <MInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <MInput
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            showPasswordToggle
          />
          <MInput
            label="Konfirmasi Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            showPasswordToggle
          />
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white focus:border-[#0A0A0A] focus:outline-none"
            >
              <option value="Admin">Admin</option>
              <option value="Kasir">Kasir</option>
              <option value="Packaging">Packaging</option>
            </select>
          </div>
        </div>
      </MModal>

      {/* Delete Confirmation Modal */}
      <MModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="xs"
        footer={
          <>
            <MButton variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Batal
            </MButton>
            <MButton variant="danger" onClick={handleDeleteEmployee}>
              Hapus
            </MButton>
          </>
        }
      >
        <div className="text-center py-2">
          <p className="text-[#0A0A0A]">
            Hapus akun <span className="font-semibold">{selectedEmployee?.name}</span>?
          </p>
          <p className="text-sm text-[#6B7280] mt-2">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </MModal>
    </SidebarLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { MBadge } from "@/components/manola/MBadge"
import { LayoutDashboard, Users, UserCog, Settings, Package, ClipboardList, Sliders } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"
import { employeeService, authService } from "@/lib/services"
import type { User } from "@/lib/services/authService"
import type { EmployeeRole } from "@/lib/services/miscServices"
import { toast } from "sonner"

import { ownerNavItems as navItems } from "@/components/layouts/ownerNav"

export default function OwnerKaryawanPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const currentUser = authService.getCurrentUser()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    no_telepon: "",
    role: "ADMIN" as EmployeeRole,
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    no_telepon: "",
    role: "ADMIN" as EmployeeRole,
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
    setLoading(true)
    try {
      const data = await employeeService.getAll()
      setEmployees(data)
    } catch (err) {
      console.error("Failed to load employees:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.no_telepon) {
      toast.error("Semua field wajib diisi")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok")
      return
    }

    setSubmitting(true)
    try {
      const newEmployee = await employeeService.create({
        nama: formData.name,
        email: formData.email,
        password: formData.password,
        no_telepon: formData.no_telepon,
        role: formData.role,
      })
      setEmployees([...employees, newEmployee])
      setShowAddModal(false)
      setFormData({ name: "", email: "", password: "", confirmPassword: "", no_telepon: "", role: "ADMIN" })
      toast.success("Karyawan berhasil ditambahkan")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menambahkan karyawan"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return
    if (!editFormData.name || !editFormData.no_telepon) {
      toast.error("Nama dan No. Telepon wajib diisi")
      return
    }
    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok")
      return
    }

    setSubmitting(true)
    try {
      const payload: { nama: string; no_telepon: string; role: EmployeeRole; password?: string } = {
        nama: editFormData.name,
        no_telepon: editFormData.no_telepon,
        role: editFormData.role,
      }
      if (editFormData.password) {
        payload.password = editFormData.password
      }
      const updated = await employeeService.update(selectedEmployee.id, payload)
      setEmployees(employees.map((e) => (e.id === selectedEmployee.id ? updated : e)))
      setShowEditModal(false)
      setSelectedEmployee(null)
      toast.success("Data karyawan berhasil diperbarui")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui karyawan"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return

    setSubmitting(true)
    try {
      await employeeService.delete(selectedEmployee.id)
      setEmployees(employees.filter((e) => e.id !== selectedEmployee.id))
      setShowDeleteModal(false)
      setSelectedEmployee(null)
      toast.success("Karyawan berhasil dihapus")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus karyawan"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case "ADMIN": return "info"
      case "KASIR": return "warning"
      case "PACKAGING": return "gray"
      default: return "gray"
    }
  }

  const columns = [
    { key: "name", label: "Nama", render: (item: User) => <span className="font-medium">{item.nama}</span> },
    { key: "email", label: "Email", render: (item: User) => item.email },
    { key: "no_telepon", label: "No. Telepon", render: (item: User) => item.no_telepon || "-" },
    {
      key: "role",
      label: "Role",
      render: (item: User) => (
        <MBadge variant={getRoleBadgeVariant(item.role) as "info" | "warning" | "gray"}>
          {item.role}
        </MBadge>
      ),
    },
    {
      key: "createdAt",
      label: "Tanggal Dibuat",
      render: (item: User) =>
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "action",
      label: "Aksi",
      render: (item: User) => (
        <div className="flex items-center gap-2">
          <MButton
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => {
              setSelectedEmployee(item)
              setEditFormData({
                name: item.nama,
                no_telepon: item.no_telepon || "",
                role: item.role as EmployeeRole,
                password: "",
                confirmPassword: "",
              })
              setShowEditModal(true)
            }}
          >
            Edit
          </MButton>
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
        </div>
      ),
    },
  ]

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Karyawan</h1>
        <MButton variant="primary" onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
          + Tambah Karyawan
        </MButton>
      </div>

      {loading ? (
        <MLoader />
      ) : (
        <MCard padding="sm">
          <MTable columns={columns} data={employees} />
        </MCard>
      )}

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
            <MButton variant="primary" onClick={handleAddEmployee} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
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
            label="No. Telepon"
            type="tel"
            value={formData.no_telepon}
            onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white focus:border-[#0A0A0A] focus:outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="KASIR">Kasir</option>
              <option value="PACKAGING">Packaging</option>
            </select>
          </div>
        </div>
      </MModal>

      {/* Edit Employee Modal */}
      <MModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Akun Karyawan"
        maxWidth="md"
        footer={
          <>
            <MButton variant="ghost" onClick={() => setShowEditModal(false)}>
              Batal
            </MButton>
            <MButton variant="primary" onClick={handleEditEmployee} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </MButton>
          </>
        }
      >
        <div className="space-y-4">
          <MInput
            label="Nama Lengkap"
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
          />
          <MInput
            label="Email (Tidak dapat diubah)"
            type="email"
            value={selectedEmployee?.email || ""}
            disabled
          />
          <MInput
            label="No. Telepon"
            type="tel"
            value={editFormData.no_telepon}
            onChange={(e) => setEditFormData({ ...editFormData, no_telepon: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Role</label>
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as EmployeeRole })}
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white focus:border-[#0A0A0A] focus:outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="KASIR">Kasir</option>
              <option value="PACKAGING">Packaging</option>
            </select>
          </div>
          <MInput
            label="Password Baru (Kosongkan jika tidak diubah)"
            type="password"
            value={editFormData.password}
            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
            showPasswordToggle
          />
          <MInput
            label="Konfirmasi Password Baru"
            type="password"
            value={editFormData.confirmPassword}
            onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })}
            showPasswordToggle
          />
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
            <MButton variant="danger" onClick={handleDeleteEmployee} disabled={submitting}>
              {submitting ? "Menghapus..." : "Hapus"}
            </MButton>
          </>
        }
      >
        <div className="text-center py-2">
          <p className="text-[#0A0A0A]">
            Hapus akun <span className="font-semibold">{selectedEmployee?.nama}</span>?
          </p>
          <p className="text-sm text-[#6B7280] mt-2">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </MModal>
    </SidebarLayout>
  )
}

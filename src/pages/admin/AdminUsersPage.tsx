import React from 'react'
import { Edit3, Lock, PlusCircle, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminFilters } from '@/components/admin/AdminFilters'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminUsers } from '@/data/adminMockData'

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="User Management"
        description="Control access levels and manage creative accounts across the production workspace."
        action={<AdminButton icon={UserPlus}>Add New User</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Users" value="1,284" helper="+12% this month" icon={Users} accent="green" />
        <AdminStatCard label="Active Editors" value="42" helper="Production-ready reviewers" icon={Edit3} />
        <AdminStatCard label="System Admins" value="05" helper="Elevated access accounts" icon={ShieldCheck} />
        <AdminStatCard label="Storage Usage" value="82%" helper="Archive allocation" dark />
      </div>

      <div className="flex flex-col gap-4 border-b-2 border-manga-ink pb-6 lg:flex-row lg:items-center lg:justify-between">
        <AdminFilters tabs={['All Roles (1,284)', 'Admin', 'Editor']} />
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase">Sort by:</span>
          <button className="border-2 border-manga-ink bg-white px-5 py-3 text-sm font-black shadow-[3px_3px_0_rgba(0,0,0,1)]">
            Recently Joined
          </button>
        </div>
      </div>

      <AdminTableFrame>
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#282828] text-white">
            <tr className="text-sm font-black uppercase">
              <th className="border-r-2 border-black px-8 py-5">User Profile</th>
              <th className="border-r-2 border-black px-7 py-5">Contact Email</th>
              <th className="border-r-2 border-black px-7 py-5">Role</th>
              <th className="border-r-2 border-black px-7 py-5">Status</th>
              <th className="px-7 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((user) => (
              <tr key={user.user_id} className="border-b-2 border-manga-ink last:border-b-0">
                <td className="border-r-2 border-manga-ink px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img src={user.avatar_url || undefined} alt={user.username} className="h-12 w-12 border-2 border-manga-ink object-cover" />
                    <div>
                      <p className="font-black">{user.username}</p>
                      <p className="text-xs font-black uppercase text-gray-400">Joined {formatDate(user.created_at)}</p>
                    </div>
                  </div>
                </td>
                <td className="border-r-2 border-manga-ink px-7 py-6 font-semibold">{user.email}</td>
                <td className="border-r-2 border-manga-ink px-7 py-6">
                  <span className="border-2 border-manga-ink bg-blue-100 px-3 py-1 text-xs font-black uppercase text-blue-700">
                    {user.role}
                  </span>
                </td>
                <td className="border-r-2 border-manga-ink px-7 py-6">
                  <AdminStatusBadge status={user.status} />
                </td>
                <td className="px-7 py-6">
                  <div className="flex justify-end gap-3">
                    <button className="flex h-12 w-12 items-center justify-center border-2 border-manga-ink bg-white">
                      <Edit3 className="h-5 w-5" />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center border-2 border-manga-ink bg-white">
                      <Lock className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-8 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-black uppercase">Showing 1-10 of 1,284 users</p>
          <AdminPagination />
        </div>
      </AdminTableFrame>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="border-2 border-manga-ink bg-[#282828] p-8 text-white shadow-[8px_8px_0_rgba(232,23,63,1)]">
          <h2 className="font-manga text-3xl font-black uppercase">Global System Permissions</h2>
          <p className="mt-4 max-w-2xl font-semibold text-gray-300">
            New security protocols mandate two-factor authentication for all Admin and Editor roles starting next sprint.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <AdminButton variant="white">Review Policy</AdminButton>
            <AdminButton variant="dark" className="border-white">Download Log</AdminButton>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center border-2 border-manga-ink bg-white p-8 text-center shadow-[6px_6px_0_rgba(0,0,0,1)]">
          <div className="mb-5 flex h-20 w-20 items-center justify-center border-2 border-manga-ink bg-manga-red text-white shadow-[5px_5px_0_rgba(0,0,0,1)]">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <p className="font-black uppercase">User Trust Score</p>
          <p className="font-manga text-5xl font-black text-manga-red">98.4%</p>
          <p className="mt-3 text-xs font-black uppercase text-gray-400">Based on system integrity checks</p>
        </div>
      </div>
    </div>
  )
}

import React from 'react'

interface AdminStatusBadgeProps {
  status: string
}

const statusText: Record<string, string> = {
  active: 'Active',
  approved: 'Approved',
  published: 'Published',
  completed: 'Validated',
  pending_review: 'Pending',
  pending: 'Pending',
  review: 'In Review',
  in_progress: 'In Progress',
  draft: 'Draft',
  suspended: 'Locked',
  banned: 'Locked',
  hidden: 'Hidden',
  needs_revision: 'Urgent',
  submitted: 'Submitted',
  verified: 'Verified',
}

const getStatusClass = (status: string) => {
  if (['active', 'approved', 'published', 'completed', 'verified'].includes(status)) {
    return 'bg-emerald-400 text-black'
  }
  if (['pending_review', 'pending', 'review', 'submitted'].includes(status)) {
    return 'bg-yellow-300 text-black'
  }
  if (['needs_revision', 'suspended', 'banned', 'hidden', 'rejected'].includes(status)) {
    return 'bg-manga-red text-white'
  }
  if (['in_progress'].includes(status)) {
    return 'bg-purple-400 text-black'
  }
  return 'bg-gray-300 text-black'
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()

  return (
    <span className={`inline-flex items-center justify-center border-2 border-manga-ink px-3 py-1 text-xs font-black uppercase leading-none shadow-[3px_3px_0px_rgba(0,0,0,1)] ${getStatusClass(normalizedStatus)}`}>
      {statusText[normalizedStatus] || normalizedStatus.replace(/_/g, ' ')}
    </span>
  )
}

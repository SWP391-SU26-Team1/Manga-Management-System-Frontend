import React from 'react'
import { SharedLayout } from '../SharedLayout'
import AdminHeader from './AdminHeader'

export default function AdminLayout() {
  return <SharedLayout header={<AdminHeader />} />
}

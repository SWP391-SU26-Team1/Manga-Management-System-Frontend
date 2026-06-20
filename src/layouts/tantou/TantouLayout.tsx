import React from 'react'
import { SharedLayout } from '../SharedLayout'
import TantouHeader from './TantouHeader'

export default function TantouLayout() {
  return <SharedLayout header={<TantouHeader />} />
}

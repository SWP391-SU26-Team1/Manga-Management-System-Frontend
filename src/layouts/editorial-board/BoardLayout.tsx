import React from 'react'
import { SharedLayout } from '../SharedLayout'
import BoardHeader from './BoardHeader'

export default function BoardLayout() {
  return <SharedLayout header={<BoardHeader />} />
}

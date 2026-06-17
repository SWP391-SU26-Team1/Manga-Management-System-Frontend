import React from 'react'
import { SharedLayout } from '../SharedLayout'
import { Header as AssistantHeader } from './AssistantHeader'

export default function AssistantLayout() {
  return <SharedLayout header={<AssistantHeader />} />
}

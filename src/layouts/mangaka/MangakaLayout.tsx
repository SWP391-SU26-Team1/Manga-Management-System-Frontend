import React from 'react'
import { SharedLayout } from '../SharedLayout'
import { Header as MangakaHeader } from './MangakaHeader'

export default function MangakaLayout() {
  return <SharedLayout header={<MangakaHeader />} />
}

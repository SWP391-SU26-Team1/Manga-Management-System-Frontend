import React from 'react'

export default function TantouSidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-r-4 border-manga-ink flex flex-col fixed top-0 left-0 z-40">
      <div className="p-5 border-b-2 border-manga-ink">
        <h1 className="font-manga text-3xl font-bold uppercase text-manga-red tracking-wide">
          MANGAFLOW
        </h1>
        <p className="font-bold text-manga-ink mt-1 text-sm leading-tight capitalize">
          Tantou Editor Panel
        </p>
      </div>
    </aside>
  )
}

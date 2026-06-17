import React, { useState } from 'react'
import { CheckCircle2, ClipboardCheck, FileText, Filter, Plus, RotateCcw, ZoomIn } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { adminPageRegions, adminPages, adminPageTasks } from '@/data/adminMockData'

export default function AdminPagesPage() {
  const [selectedPageId, setSelectedPageId] = useState(adminPages[1]?.page_id || adminPages[0]?.page_id)
  const selectedPage = adminPages.find((page) => page.page_id === selectedPageId) || adminPages[0]

  if (!selectedPage) {
    return null
  }

  const pageRegions = adminPageRegions.filter((region) => region.page_id === selectedPage.page_id)
  const pageTasks = adminPageTasks.filter((task) => task.page_id === selectedPage.page_id)

  return (
    <div className="grid min-h-[calc(100vh-9rem)] grid-cols-1 gap-8 xl:grid-cols-[1fr_560px]">
      <section>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-manga text-5xl font-black uppercase leading-none">Page Archive</h1>
            <p className="mt-3 text-sm font-black uppercase text-gray-600">Chapter 42: "The Crimson Eclipse" - 24 pages total</p>
          </div>
          <div className="flex gap-3">
            <button className="flex h-14 w-14 items-center justify-center border-2 border-manga-ink bg-white"><Filter className="h-6 w-6" /></button>
            <button className="flex h-14 w-14 items-center justify-center border-2 border-manga-ink bg-[#282828] text-white shadow-[4px_4px_0_rgba(0,0,0,1)]"><Plus className="h-6 w-6" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {adminPages.map((page) => (
            <button
              key={page.page_id}
              onClick={() => setSelectedPageId(page.page_id)}
              className={`group relative min-h-[330px] overflow-hidden border-4 bg-white text-left shadow-[5px_5px_0_rgba(0,0,0,1)] ${selectedPageId === page.page_id ? 'border-manga-red' : 'border-manga-ink'}`}
            >
              <img src={page.image_url || undefined} alt={`Page ${page.page_number}`} className="h-[330px] w-full object-cover grayscale transition-all group-hover:grayscale-0" />
              <span className={`absolute right-0 top-0 border-b-2 border-l-2 border-manga-ink px-4 py-2 text-xs font-black uppercase text-white ${page.status === 'completed' ? 'bg-emerald-500' : page.status === 'review' ? 'bg-manga-red' : 'bg-black'}`}>
                {page.status === 'completed' ? 'Validated' : page.status === 'review' ? 'Pending' : 'OCR Error'}
              </span>
              <span className="absolute bottom-0 left-0 bg-black px-4 py-2 text-sm font-black uppercase text-white">Page {String(page.page_number).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="border-l-4 border-manga-ink bg-white xl:-my-8 xl:-mr-8">
        <div className="relative h-[420px] overflow-hidden bg-black p-8">
          <img src={selectedPage.image_url || undefined} alt="Selected page preview" className="h-full w-full object-cover opacity-55 grayscale" />
          <button className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center bg-white text-black"><ZoomIn className="h-6 w-6" /></button>
          {pageRegions.map((region, index) => (
            <div
              key={region.region_id}
              className={`absolute border-4 ${index === 0 ? 'border-manga-red' : index === 1 ? 'border-blue-500' : 'border-purple-500'}`}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
            >
              <span className={`absolute -top-8 left-0 px-2 py-1 text-xs font-black uppercase text-white ${index === 0 ? 'bg-manga-red' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}>
                Region #{String(index + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-7 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-manga text-4xl font-black uppercase">Page {String(selectedPage.page_number).padStart(2, '0')} Details</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="bg-black px-4 py-2 text-xs font-black uppercase text-white">Ready For Review</span>
                <span className="border-2 border-manga-ink px-4 py-2 text-xs font-black uppercase text-manga-red">Manual Check Req.</span>
              </div>
            </div>
            <div className="flex gap-3">
              <AdminButton icon={RotateCcw} variant="dark">Redo OCR</AdminButton>
              <AdminButton icon={CheckCircle2}>Validate Page</AdminButton>
            </div>
          </div>

          <div className="border-2 border-manga-ink p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-black uppercase"><FileText className="h-5 w-5 text-manga-red" /> OCR Performance</span>
              <span className="text-sm font-black text-manga-red">98.4% Confidence</span>
            </div>
            <div className="h-5 border-2 border-manga-ink bg-gray-100">
              <div className="h-full bg-manga-red" style={{ width: '98.4%' }} />
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase">Identified Regions ({pageRegions.length})</h3>
              <button className="text-sm font-black uppercase text-manga-red underline decoration-2 underline-offset-4">Edit Layout</button>
            </div>
            <div className="space-y-3">
              {pageRegions.map((region, index) => (
                <div key={region.region_id} className={`border-2 border-manga-ink bg-white p-4 ${index === 1 ? 'border-l-8 border-l-blue-500' : index === 2 ? 'border-l-8 border-l-purple-500' : 'border-l-8 border-l-manga-red'}`}>
                  <p className="text-sm font-black uppercase">Region #{String(index + 1).padStart(2, '0')}: {index === 0 ? 'Kira (Main)' : index === 1 ? 'Stone Chamber' : 'Dialogue Bubbles'}</p>
                  <p className="text-xs font-black uppercase text-gray-500">{region.width * 10} x {region.height * 10} px</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase"><ClipboardCheck className="h-5 w-5" /> Active Tasks</h3>
            <div className="space-y-3">
              {pageTasks.map((task) => (
                <div key={task.task_id} className="relative border-2 border-manga-ink bg-red-50 p-5">
                  <span className="absolute -right-2 -top-4 border-2 border-manga-ink bg-manga-red px-3 py-1 text-xs font-black uppercase text-white">Urgent</span>
                  <p className="font-black uppercase">{task.task_type}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-700">{task.content}</p>
                  <div className="mt-3"><AdminStatusBadge status={task.status} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

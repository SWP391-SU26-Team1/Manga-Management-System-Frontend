import React from 'react'
import { Link } from 'react-router'
import { PublishedSeries } from '@/types/reader.types'

interface SeriesCardProps {
  series: PublishedSeries
}

export default function SeriesCard({ series }: SeriesCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHING': return 'bg-manga-red text-white border-manga-red'
      case 'COMPLETED': return 'bg-blue-600 text-white border-blue-600'
      case 'HIATUS': return 'bg-yellow-400 text-manga-ink border-manga-ink'
      default: return 'bg-white text-manga-ink border-manga-ink'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHING': return 'Đã xuất bản'
      case 'COMPLETED': return 'Hoàn thành'
      case 'HIATUS': return 'Tạm dừng'
      default: return 'Đang làm'
    }
  }

  return (
    <Link to={`/series/${series.id}`} className="group cursor-pointer block">
      <div className="manga-border manga-shadow aspect-[3/4] relative overflow-hidden mb-4 bg-gray-200 group-hover:-translate-y-1 transition-transform dark:bg-zinc-800 dark:border-black">
        <img 
          src={series.coverImageUrl || '/placeholder.png'} 
          alt={series.title} 
          className="w-full h-full object-cover" 
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://fakeimg.pl/400x600/282828/eae0d0/?text=No+Cover' }}
        />
        <div className={`absolute top-2 right-2 border-2 px-2 py-1 text-xs font-bold uppercase shadow-sm ${getStatusColor(series.status)}`}>
          {getStatusLabel(series.status)}
        </div>
      </div>
      <h3 className="font-manga text-xl font-bold uppercase text-manga-ink group-hover:text-manga-red transition-colors line-clamp-2 dark:text-white dark:group-hover:text-manga-red">
        {series.title}
      </h3>
      <p className="text-sm text-gray-500 font-bold mt-1 dark:text-gray-400">
        {series.authorName} · {series.genre}
      </p>
    </Link>
  )
}

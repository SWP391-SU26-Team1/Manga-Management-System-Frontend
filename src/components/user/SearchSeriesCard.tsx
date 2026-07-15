import React from 'react'
import { Link } from 'react-router'
import { Star } from 'lucide-react'
import { PublishedSeries } from '@/types/reader.types'

interface SearchSeriesCardProps {
  series: PublishedSeries
}

export default function SearchSeriesCard({ series }: SearchSeriesCardProps) {
  return (
    <Link to={`/series/${series.id}`} className="group block bg-white border-[3px] border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all flex flex-col h-full dark:bg-zinc-800 dark:border-black dark:shadow-[6px_6px_0px_#000] dark:hover:shadow-[2px_2px_0px_#000]">
      {/* Cover Image Container */}
      <div className="relative aspect-[2/3] bg-gray-200 border-b-[3px] border-black overflow-hidden dark:bg-zinc-700 dark:border-black">
        <img 
          src={series.coverImageUrl || '/placeholder.png'} 
          alt={series.title} 
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://fakeimg.pl/400x600/282828/eae0d0/?text=COVER' }}
        />
        {/* Badge - Example: NEW or Rank */}
        {series.isNew && (
          <div className="absolute top-0 left-0 bg-manga-red text-white px-2 py-0.5 text-xs font-bold uppercase border-r-[3px] border-b-[3px] border-black dark:border-black">
            NEW
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-manga text-lg font-bold uppercase text-black line-clamp-2 leading-tight group-hover:text-manga-red transition-colors dark:text-white dark:group-hover:text-manga-red">
          {series.title}
        </h3>
        <p className="text-sm text-gray-600 font-bold mt-1 line-clamp-1 dark:text-gray-400">{series.authorName}</p>
        
        <div className="mt-auto pt-3">
          <div className="border-t-2 border-dashed border-gray-300 w-full mb-3 dark:border-zinc-600"></div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-manga-red font-bold">
              <Star className="w-4 h-4 fill-manga-red mr-1" />
              {series.rating.toFixed(1)}
            </div>
            <div className="border-2 border-black px-2 py-0.5 text-xs font-bold uppercase bg-white dark:bg-zinc-700 dark:border-black dark:text-white">
              Ch. {series.totalChapters}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

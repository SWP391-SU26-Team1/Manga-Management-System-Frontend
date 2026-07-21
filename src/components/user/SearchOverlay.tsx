import React, { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { readerService } from '@/services/reader.service'
import { SearchResult, GENRES } from '@/types/reader.types'
import SearchSeriesCard from '@/components/user/SearchSeriesCard'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchInput, setSearchInput] = useState('')
  const [activeGenre, setActiveGenre] = useState('Tất cả')
  const [page, setPage] = useState(1)
  
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = (query: string, genre: string, pageNum: number) => {
    setLoading(true)
    readerService.searchSeries({ 
      query, 
      genre: genre !== 'Tất cả' ? genre : undefined,
      page: pageNum,
      limit: 5
    })
      .then(res => {
        setResults(res)
        setLoading(false)
        setHasSearched(true)
      })
  }

  // Trigger search when genre, page or isOpen changes
  useEffect(() => {
    if (isOpen) {
      performSearch(searchInput, activeGenre, page)
    }
  }, [activeGenre, page, isOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    if (page === 1) {
      performSearch(searchInput, activeGenre, 1)
    }
  }

  const handleGenreChange = (genre: string) => {
    setActiveGenre(genre)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && results && newPage <= results.totalPages) {
      setPage(newPage)
    }
  }

  if (!isOpen) return null

  const displaySeries = results?.series || []

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 dark:bg-black/80 transition-colors">
      {/* Overlay background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Content - matching Image 1 layout */}
      <div className="relative w-full max-w-6xl z-10 flex flex-col max-h-[95vh] mt-8">
        
        {/* Tab Label "TÌM KIẾM" */}
        <div className="absolute -top-[34px] left-0 bg-black text-white px-6 py-2 font-manga text-xl font-bold uppercase z-10 clip-tab dark:bg-white dark:text-black" style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0% 100%)', paddingRight: '2rem' }}>
          TÌM KIẾM
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-[22px] -right-[10px] md:-right-[22px] bg-manga-red text-white border-4 border-black p-2 hover:bg-red-700 transition-colors z-20 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:border-black dark:shadow-[4px_4px_0px_#000]"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
        </button>

        {/* Main Box */}
        <div className="bg-white border-[6px] border-black p-4 md:p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)] overflow-y-auto flex-1 custom-scrollbar dark:bg-zinc-800 dark:border-black dark:shadow-[12px_12px_0px_#000]">
          
          {/* Search Bar Container */}
          <form onSubmit={handleSearch} className="flex bg-[#E2E2E2] p-2 mb-6 items-center dark:bg-zinc-700">
            <Search className="w-6 h-6 text-gray-500 ml-2 md:ml-4 mr-2" />
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tên truyện, tác giả..."
              autoFocus
              className="flex-1 bg-transparent text-sm md:text-lg font-bold outline-none text-black px-2 placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
            />
            <button type="submit" className="bg-manga-red text-white font-manga text-xl md:text-2xl font-bold uppercase px-4 md:px-8 py-2 md:py-3 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
              TÌM KIẾM
            </button>
          </form>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleGenreChange('Tất cả')}
              className={`px-3 py-1.5 border-[2px] border-black font-bold text-xs uppercase transition-all ${
                activeGenre === 'Tất cả' 
                  ? 'bg-manga-red text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] translate-y-[2px] translate-x-[2px] dark:border-black' 
                  : 'bg-white text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[2px_2px_0px_#000]'
              }`}
            >
              Tất cả
            </button>
            {GENRES.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGenreChange(g.name)}
                className={`px-3 py-1.5 border-[2px] border-black font-bold text-xs uppercase transition-all flex items-center gap-1 ${
                  activeGenre === g.name 
                    ? 'bg-manga-red text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] translate-y-[2px] translate-x-[2px] dark:border-black' 
                    : 'bg-white text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[2px_2px_0px_#000]'
                }`}
              >
                <span>{g.name}</span>
                <span className="text-[10px]">{g.icon}</span>
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
            <h2 className="font-bold text-sm md:text-lg text-black uppercase tracking-wide dark:text-white">
              Tìm thấy <span className="text-manga-red">{results ? results.total : 0} series</span> {searchInput ? `cho "${searchInput}"` : ''}
            </h2>
            
            <div className="flex flex-wrap gap-2 w-full xl:w-auto">

              <select className="border-[3px] border-black bg-white px-3 py-1.5 md:px-4 md:py-2 font-bold text-xs md:text-sm outline-none cursor-pointer appearance-none uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex-1 xl:flex-none dark:bg-zinc-700 dark:border-black dark:text-white dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[2px_2px_0px_#000]" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto', paddingRight: '2rem' }}>
                <option>Trạng thái: Tất cả</option>
                <option>Đang tiến hành</option>
                <option>Hoàn thành</option>
              </select>

              <select className="border-[3px] border-black bg-white px-3 py-1.5 md:px-4 md:py-2 font-bold text-xs md:text-sm outline-none cursor-pointer appearance-none uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex-1 xl:flex-none dark:bg-zinc-700 dark:border-black dark:text-white dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[2px_2px_0px_#000]" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto', paddingRight: '2rem' }}>
                <option>Sắp xếp: Phổ biến nhất</option>
                <option>Mới cập nhật</option>
                <option>Đánh giá cao</option>
              </select>
            </div>
          </div>

          <div className="border-t-4 border-dashed border-black w-full mb-8 dark:border-zinc-700"></div>

          {/* Results Grid */}
          {loading ? (
            <div className="h-64 flex items-center justify-center font-bold uppercase animate-pulse text-gray-500">
              Đang tải kết quả...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displaySeries.map((series, idx) => (
                <div 
                  key={`search-${series.id}`} 
                  className="animate-slide-up" 
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={onClose} // close modal when a series is clicked
                >
                  <SearchSeriesCard series={series} />
                </div>
              ))}
              
              {/* Optional: Add empty placeholder cards if there are few results to match mockup */}
              {displaySeries.length > 0 && displaySeries.length < 5 && Array.from({length: 5 - displaySeries.length}).map((_, idx) => (
                <div key={`empty-${idx}`} className="hidden lg:flex flex-col bg-gray-50 border-[3px] border-dashed border-gray-300 opacity-50 h-full min-h-[250px] animate-slide-up dark:bg-zinc-800 dark:border-zinc-600" style={{ animationDelay: `${(displaySeries.length + idx) * 0.1}s` }}>
                  <div className="aspect-[2/3] border-b-[3px] border-dashed border-gray-300 flex items-center justify-center font-bold uppercase text-gray-400 text-xs dark:border-zinc-600 dark:text-gray-500">
                    Cover
                  </div>
                </div>
              ))}
              
              {displaySeries.length === 0 && hasSearched && (
                <div className="col-span-full h-40 flex items-center justify-center font-bold uppercase text-gray-500">
                  Không tìm thấy truyện nào
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {results && results.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 mb-4">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className={`w-8 h-8 flex items-center justify-center border-[3px] border-black font-bold transition-all ${
                  page <= 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-500' 
                    : 'bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: results.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={`page-${p}`}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center border-[3px] border-black font-bold transition-all ${
                    page === p
                      ? 'bg-black text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none'
                      : 'bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= results.totalPages}
                className={`w-8 h-8 flex items-center justify-center border-[3px] border-black font-bold transition-all ${
                  page >= results.totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-500' 
                    : 'bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Scrollbar styling for modal */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-left: 2px solid black;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888; 
          border: 2px solid black;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555; 
        }
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}

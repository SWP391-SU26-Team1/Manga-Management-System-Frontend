import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { readerService } from '@/services/reader.service'
import { SearchResult } from '@/types/reader.types'
import SearchSeriesCard from '@/components/user/SearchSeriesCard'

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const genreQuery = searchParams.get('genre') || 'Action'
  const textQuery = searchParams.get('q') || ''

  const [searchInput, setSearchInput] = useState(textQuery)
  const [activeGenre, setActiveGenre] = useState(genreQuery)
  
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    readerService.searchSeries({ query: textQuery, genre: activeGenre !== 'Tất cả' ? activeGenre : undefined })
      .then(res => {
        setResults(res)
        setLoading(false)
      })
  }, [textQuery, activeGenre])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newParams = new URLSearchParams()
    if (searchInput) newParams.set('q', searchInput)
    if (activeGenre && activeGenre !== 'Tất cả') newParams.set('genre', activeGenre)
    setSearchParams(newParams)
  }

  // Generate some fake empty items to fill the grid up to 5 items if we don't have enough, 
  // just to match the visual of the mockup where there are placeholder cards.
  // In reality we would just render what we have.
  const displaySeries = results?.series || []
  
  return (
    <div className="min-h-screen bg-[#E5E5E5] py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Tab Label "TÌM KIẾM" */}
        <div className="absolute -top-[34px] left-0 bg-black text-white px-6 py-2 font-manga text-xl font-bold uppercase z-10 clip-tab dark:bg-white dark:text-black">
          TÌM KIẾM
        </div>

        {/* Main Box */}
        <div className="bg-white border-[6px] border-black p-6 md:p-8 relative shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[8px_8px_0px_#000]">
          
          {/* Search Bar Container */}
          <form onSubmit={handleSearch} className="flex bg-[#E2E2E2] p-2 mb-6 items-center dark:bg-zinc-700">
            <Search className="w-6 h-6 text-gray-500 ml-4 mr-2" />
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tên truyện, tác giả..."
              className="flex-1 bg-transparent text-lg font-bold outline-none text-black px-2 placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
            />
            <button type="submit" className="bg-manga-red text-white font-manga text-2xl font-bold uppercase px-8 py-3 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
              TÌM KIẾM
            </button>
          </form>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="font-bold text-lg text-black uppercase tracking-wide dark:text-white">
              Tìm thấy <span className="text-manga-red">{results ? results.total : 0} series</span> {searchInput ? `cho "${searchInput}"` : ''}
            </h2>
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={activeGenre} 
                onChange={(e) => {
                  setActiveGenre(e.target.value)
                  const newParams = new URLSearchParams(searchParams)
                  newParams.set('genre', e.target.value)
                  setSearchParams(newParams)
                }}
                className="border-[3px] border-black bg-white px-4 py-2 font-bold text-sm outline-none cursor-pointer appearance-none uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all dark:bg-zinc-700 dark:border-black dark:text-white dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[2px_2px_0px_#000]"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto', paddingRight: '2.5rem' }}
              >
                <option value="Tất cả">Thể loại: Tất cả</option>
                <option value="Action">Thể loại: Action</option>
                <option value="Fantasy">Thể loại: Fantasy</option>
                <option value="Romance">Thể loại: Romance</option>
                <option value="Sci-Fi">Thể loại: Sci-Fi</option>
              </select>

              <select className="border-[3px] border-black bg-white px-4 py-2 font-bold text-sm outline-none cursor-pointer appearance-none uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all dark:bg-zinc-700 dark:border-black dark:text-white dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[2px_2px_0px_#000]" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto', paddingRight: '2.5rem' }}>
                <option>Trạng thái: Tất cả</option>
                <option>Đang tiến hành</option>
                <option>Hoàn thành</option>
              </select>

              <select className="border-[3px] border-black bg-white px-4 py-2 font-bold text-sm outline-none cursor-pointer appearance-none uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all dark:bg-zinc-700 dark:border-black dark:text-white dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[2px_2px_0px_#000]" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto', paddingRight: '2.5rem' }}>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {displaySeries.map((series, idx) => (
                <div key={`search-${series.id}`} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <SearchSeriesCard series={series} />
                </div>
              ))}
              
              {/* Optional: Add empty placeholder cards if there are few results to match mockup */}
              {displaySeries.length > 0 && displaySeries.length < 5 && Array.from({length: 5 - displaySeries.length}).map((_, idx) => (
                <div key={`empty-${idx}`} className="hidden lg:flex flex-col bg-gray-50 border-[3px] border-dashed border-gray-300 opacity-50 h-full min-h-[300px] animate-slide-up dark:bg-zinc-800 dark:border-zinc-600" style={{ animationDelay: `${(displaySeries.length + idx) * 0.1}s` }}>
                  <div className="aspect-[2/3] border-b-[3px] border-dashed border-gray-300 flex items-center justify-center font-bold uppercase text-gray-400 dark:border-zinc-600 dark:text-gray-500">
                    Cover
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-end">
                    <div className="h-4 bg-gray-300 w-3/4 mb-2 dark:bg-zinc-700"></div>
                    <div className="h-3 bg-gray-200 w-1/2 mb-4 dark:bg-zinc-600"></div>
                    <div className="border-t-2 border-dashed border-gray-300 mb-3 dark:border-zinc-600"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 w-8 dark:bg-zinc-700"></div>
                      <div className="h-5 bg-gray-300 w-12 border-2 border-gray-400 dark:bg-zinc-700 dark:border-zinc-500"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-12 mb-4">
            <button className="w-10 h-10 flex items-center justify-center border-[3px] border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] font-bold transition-all dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center border-[3px] border-black bg-black text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] font-bold transition-all dark:bg-white dark:text-black dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
              1
            </button>
            <button className="w-10 h-10 flex items-center justify-center border-[3px] border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] font-bold transition-all dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center border-[3px] border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] font-bold transition-all dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
              3
            </button>
            <span className="font-bold tracking-widest px-2 dark:text-white">...</span>
            <button className="w-10 h-10 flex items-center justify-center border-[3px] border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] font-bold transition-all dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
              9
            </button>
            <button className="w-10 h-10 flex items-center justify-center border-[3px] border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] font-bold transition-all dark:bg-zinc-800 dark:text-white dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
      
      {/* Required CSS for the clip-tab effect */}
      <style>{`
        .clip-tab {
          clip-path: polygon(0 0, 100% 0, 90% 100%, 0% 100%);
          padding-right: 2rem;
        }
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}

import {Search} from 'lucide-react'

const SearchInput = (
   { value,
    onChange ,
    placeholder = "Search...",
    className= "",}
) => {   //this here is just the search icon and the input
  return (
    <div className={`relative w-full max-w-md ${className}`}>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'></Search> 

        <input type="text" value={value} onChange={onChange} placeholder={placeholder} className='h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100' />

    </div>
  )
}

export default SearchInput
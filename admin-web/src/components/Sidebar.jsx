import React from 'react'
import { NavLink } from 'react-router-dom'


const sidebarItems=[          
    //just for the icons I can just switch them out for real icons later
    {label:"Dashboard" , path:"/" , icon:"🏠" },
    {label:"Doctors" , path:"/doctors" , icon:"👨‍⚕️" },
    {label:"Patients" , path:"/patients" , icon: "👥" },
    {label:"Secretaries" , path:"/secretaries" , icon:"👩‍💼" },
    {label:"Statistics" , path:"/statistics" , icon:"📅" }
]

const SidebarItem = ({item}) => {
    return(

        <NavLink to={item.path} end={item.path==="/"} className={({isActive})=>`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-blue-700 text-white shadow-sm":"text-slate-700 hover:bg-blue-200 hover:text-slate-900"}`}>
            <span className='text-lg'>{item.icon}</span>  
            <span>{item.label}</span>
        </NavLink>
        
    )
}

const Sidebar = () => {
  return (

    <aside className='w-64 bg-blue-100 text-slate-800 min-h-screen flex flex-col p-5'>

        <div className='flex items-center justify-between'>       {/* ----------logo area------------ */}
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white'>
             logo
            </div>

            <div> 
                <h1 className='text-lg font-bold leading-tight'>Tabibi</h1>
                <p className='text-xs text-slate-600 leading-tight'>admin panel</p>
            </div>

            <button className='rounded-lg p-2 text-slate-600 hover:bg-blue-200'>
                ☰
            </button>
        </div>

        <nav className='mt-10 flex flex-col gap-2'>        {/* Here we have the items.*/}

            {sidebarItems.map((item)=>(
                <SidebarItem key={item.path} item={item}/>
            ))}
        </nav>



    </aside>
  )
}

export default Sidebar
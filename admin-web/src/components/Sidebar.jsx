import React from 'react'
import { NavLink } from 'react-router-dom'
import { Hospital,BarChart3,ChevronRight,ChevronLeft,LayoutDashboard,Stethoscope,Users,UserRoundCog } from 'lucide-react'
import { useState } from 'react'

const sidebarItems=[          
    //just for the icons I can just switch them out for real icons later
    {label:"Dashboard" , path:"/admin" , icon:LayoutDashboard },
    {label:"Doctors" , path:"/admin/doctors" , icon:Stethoscope},
    {label:"Patients" , path:"/admin/patients" , icon: Users},
    {label:"Secretaries" , path:"/admin/secretaries" , icon:UserRoundCog },
    {label:"Clinics" , path:"/admin/clinics" , icon:Hospital },
    {label:"Statistics" , path:"/admin/statistics" , icon:BarChart3 }
]

const SidebarItem = ({item, isCollapsed}) => {
    const Icon = item.icon;
    return(

        <NavLink to={item.path}
                end={item.path==="/admin"} 
                title={isCollapsed ? item.label : ""}
                className={({ isActive }) =>
                            `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                isCollapsed ? "justify-center" : "gap-3"
                            } ${
                            isActive
                                ? "bg-[var(--color-primary)] text-white shadow-sm"
                                : "text-slate-600 hover:bg-[var(--color-primary-light)] hover:text-slate-900"}`
                                }
            >
            <Icon size={19} className="shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
        </NavLink>
        
    )
}

const Sidebar = () => {

  const [isCollapsed, setIsCollapsed]= useState(false)
  return (

    <aside className={`flex min-h-screen flex-col border-r border-slate-200 bg-white p-5 text-slate-800
                ${isCollapsed ? 'w-20' : 'w-64'}`} >

        <div className={`flex items-center justify-between`}>       {/* ----------logo area------------ */}
            <div className='flex items-center gap-3'>

                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-lg font-bold text-white'>
                T
                </div>

                { !isCollapsed && (<div > 
                    <h1 className='text-lg font-bold leading-tight text-slate-900'>Tabibi</h1>
                    <p className='text-xs text-slate-500 leading-tight'>admin panel</p>
                </div>)}
            </div>

       {!isCollapsed && (<button 
                            className='rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            type='button'
                            onClick={()=>setIsCollapsed(true)}>
                                <ChevronLeft size={19}/>
                        </button>)}
        </div>



        {isCollapsed && (
                <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="mt-4 flex h-9 w-full items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                <ChevronRight size={19} />
                </button>
            )}


        <nav className='mt-8 flex flex-col gap-1.5'>        {/* Here we have the items.*/}

            {sidebarItems.map((item)=>(
                <SidebarItem key={item.path} item={item} isCollapsed={isCollapsed}/>
            ))}
        </nav>

         {/* Bottom small text */}
  {!isCollapsed && 
        <div className="mt-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Clinic management system
        </div>}

    </aside>
  )
}

export default Sidebar
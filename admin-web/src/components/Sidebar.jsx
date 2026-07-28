import { NavLink } from 'react-router-dom'
import { CalendarClock, CalendarDays, Database, Flag, Hospital, ListOrdered, Scale, Star, ChevronRight, ChevronLeft, LayoutDashboard, Stethoscope, Users, UserRoundCog } from 'lucide-react'
import { useState } from 'react'

const sidebarItems=[          
    //just for the icons I can just switch them out for real icons later
    {label:"Dashboard" , path:"/admin" , icon:LayoutDashboard },
    {label:"Doctors" , path:"/admin/doctors" , icon:Stethoscope},
    {label:"Patients" , path:"/admin/patients" , icon: Users},
    {label:"Appointments" , path:"/admin/appointments" , icon:CalendarDays },
    {label:"Queue" , path:"/admin/queue" , icon:ListOrdered },
    {label:"Ratings" , path:"/admin/ratings" , icon:Star },
    {label:"Rating Reports" , path:"/admin/rating-reports" , icon:Flag },
    {label:"Schedule Requests" , path:"/admin/schedule-change-requests" , icon:CalendarClock },
    {label:"Data Lookups" , path:"/admin/data-lookups" , icon:Database },
    {label:"System Policies" , path:"/admin/system-policies" , icon:Scale },
    {label:"Secretaries" , path:"/admin/secretaries" , icon:UserRoundCog },
    {label:"Clinics" , path:"/admin/clinics" , icon:Hospital }
]

const SidebarItem = ({item, isCollapsed}) => {
    const Icon = item.icon;
    return(

        <NavLink to={item.path}
                end={item.path==="/admin"} 
                title={isCollapsed ? item.label : ""}
                className={({ isActive }) =>
                            `flex items-center overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out ${
                                isCollapsed ? "justify-center gap-0" : "gap-3"
                            } ${
                            isActive
                                ? "bg-[var(--color-primary)] text-white shadow-sm"
                                : "text-slate-600 hover:bg-[var(--color-primary-light)] hover:text-slate-900"}`
                                }
            >
            <Icon size={19} className="shrink-0" />
            <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                    isCollapsed ? "w-0 opacity-0" : "w-40 opacity-100"
                }`}
            >
                {item.label}
            </span>
        </NavLink>
        
    )
}

const Sidebar = () => {

  const [isCollapsed, setIsCollapsed]= useState(false)
  return (

    <aside className={`flex min-h-screen flex-col overflow-hidden border-r border-slate-200 bg-white p-5 text-slate-800 transition-[width] duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}`} >

        <div className={`flex items-center justify-between gap-2`}>       {/* ----------logo area------------ */}
            <div className='flex items-center gap-3'>

                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-lg font-bold text-white'>
                T
                </div>

                <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isCollapsed ? "w-0 opacity-0" : "w-28 opacity-100"}`}>
                    <h1 className='text-lg font-bold leading-tight text-slate-900'>Tabibi</h1>
                    <p className='text-xs text-slate-500 leading-tight'>admin panel</p>
                </div>
            </div>

       <button
                            className={`rounded-lg p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 ${
                                isCollapsed ? "pointer-events-none w-0 translate-x-2 p-0 opacity-0" : "opacity-100"
                            }`}
                            type='button'
                            onClick={()=>setIsCollapsed(true)}>
                                <ChevronLeft size={19}/>
                        </button>
        </div>



        <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className={`mt-4 flex h-9 w-full items-center justify-center rounded-lg text-slate-500 transition-all duration-300 hover:bg-slate-100 hover:text-slate-700 ${
                    isCollapsed ? "opacity-100" : "pointer-events-none h-0 translate-y-[-6px] opacity-0"
                }`}
                >
                <ChevronRight size={19} />
                </button>


        <nav className='mt-8 flex flex-col gap-1.5'>        {/* Here we have the items.*/}

            {sidebarItems.map((item)=>(
                <SidebarItem key={item.path} item={item} isCollapsed={isCollapsed}/>
            ))}
        </nav>

         {/* Bottom small text */}
        <div className={`mt-auto overflow-hidden rounded-lg bg-slate-50 text-xs text-slate-500 transition-all duration-300 ease-in-out ${
            isCollapsed ? "max-h-0 p-0 opacity-0" : "max-h-20 p-3 opacity-100"
        }`}>
        Clinic management system
        </div>

    </aside>
  )
}

export default Sidebar

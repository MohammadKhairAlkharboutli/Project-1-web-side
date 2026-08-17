import { NavLink } from 'react-router-dom'
import { CalendarClock, CalendarDays, Database, Flag, Hospital, ListOrdered, MonitorCog, Scale, Star, ChevronRight, ChevronLeft, LayoutDashboard, MailPlus, Stethoscope, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { doctorSchedulesApi } from '@/api/doctorSchedulesApi'
import { ratingsApi } from '@/api/ratingsApi'

const sidebarItems=[          
    //just for the icons I can just switch them out for real icons later
    {label:"Dashboard" , path:"/admin" , icon:LayoutDashboard },
    {label:"Doctors" , path:"/admin/doctors" , icon:Stethoscope},
    {label:"Doctor Invitations" , path:"/admin/doctor-invitations" , icon:MailPlus},
    {label:"Patients" , path:"/admin/patients" , icon: Users},
    {label:"Appointments" , path:"/admin/appointments" , icon:CalendarDays },
    {label:"Queue" , path:"/admin/queue" , icon:ListOrdered },
    {label:"Ratings" , path:"/admin/ratings" , icon:Star },
    {label:"Rating Reports" , path:"/admin/rating-reports" , icon:Flag },
    {label:"Schedule Requests" , path:"/admin/schedule-change-requests" , icon:CalendarClock },
    {label:"Data Lookups" , path:"/admin/data-lookups" , icon:Database },
    {label:"System Policies" , path:"/admin/system-policies" , icon:Scale },
    {label:"Front Desk Terminal" , path:"/admin/settings" , icon:MonitorCog },
    {label:"Clinics" , path:"/admin/clinics" , icon:Hospital }
]

const SidebarItem = ({item, isCollapsed, hasAttention}) => {
    const Icon = item.icon;
    return(

        <NavLink to={item.path}
                end={item.path==="/admin"} 
                title={isCollapsed ? item.label : ""}
                className={({ isActive }) =>
                            `relative flex items-center overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out ${
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
            {hasAttention ? (
                <span
                    aria-label="Attention required"
                    className={`absolute h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white ${isCollapsed ? "right-2 top-2" : "right-3 top-1/2 -translate-y-1/2"}`}
                />
            ) : null}
        </NavLink>
        
    )
}

const Sidebar = () => {

  const [isCollapsed, setIsCollapsed]= useState(false)
  const [attention, setAttention] = useState({
    ratingReports: false,
    scheduleRequests: false,
  })

  const refreshAttention = useCallback(async () => {
    const [scheduleRequestsResult, ratingReportsResult] = await Promise.allSettled([
      doctorSchedulesApi.getPendingScheduleRequests(),
      ratingsApi.getAdminReports({ status: "PENDING", page: 1, limit: 1 }),
    ])

    setAttention((current) => ({
      scheduleRequests: scheduleRequestsResult.status === "fulfilled"
        ? Array.isArray(scheduleRequestsResult.value) && scheduleRequestsResult.value.length > 0
        : current.scheduleRequests,
      ratingReports: ratingReportsResult.status === "fulfilled"
        ? Number(ratingReportsResult.value.total) > 0
        : current.ratingReports,
    }))
  }, [])

  useEffect(() => {
    const initialRefresh = window.setTimeout(refreshAttention, 0)
    const refreshInterval = window.setInterval(refreshAttention, 60_000)
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        refreshAttention()
      }
    }

    window.addEventListener("focus", refreshOnFocus)
    document.addEventListener("visibilitychange", refreshOnFocus)

    return () => {
      window.clearTimeout(initialRefresh)
      window.clearInterval(refreshInterval)
      window.removeEventListener("focus", refreshOnFocus)
      document.removeEventListener("visibilitychange", refreshOnFocus)
    }
  }, [refreshAttention])

  return (

    <aside className={`flex min-h-screen flex-col overflow-hidden border-r border-slate-200 bg-white p-4 text-slate-800 transition-[width] duration-300 ease-in-out sm:p-5
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


        <nav className='mt-6 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1'>

            {sidebarItems.map((item)=> {
                const hasAttention =
                    (item.path === "/admin/rating-reports" && attention.ratingReports)
                    || (item.path === "/admin/schedule-change-requests" && attention.scheduleRequests)

                return <SidebarItem key={item.path} item={item} isCollapsed={isCollapsed} hasAttention={hasAttention}/>
            })}
        </nav>

         {/* Bottom small text */}
        <div className={`mt-4 overflow-hidden rounded-lg bg-slate-50 text-xs text-slate-500 transition-all duration-300 ease-in-out ${
            isCollapsed ? "max-h-0 p-0 opacity-0" : "max-h-20 p-3 opacity-100"
        }`}>
        Clinic management system
        </div>

    </aside>
  )
}

export default Sidebar

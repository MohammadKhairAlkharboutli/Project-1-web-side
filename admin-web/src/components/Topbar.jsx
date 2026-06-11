import React from 'react'
import { useState } from 'react';
import { useLocation } from 'react-router-dom';


const Topbar = () => {
  
  const location=useLocation()
  const titles = {
    "/": "Dashboard",
    "/doctors": "Doctors",
    "/patients": "Patients",
    "/secretaries": "Secretaries",
    "/statistics": "Statistics",
  };
  const title=titles[location.pathname] || ""

  return (
    <div className='h-16 bg-white border-b px-6 flex items-center justify-between'>
        <div> {/**------left side--------- */}
          <h2 className='text-lg font-semibold'>{title}</h2>
        </div>

        <div className='flex items-center gap-6'> {/**------right side--------- */}
          <button className='text-xl'>🔔</button>

          <button className="text-xl">🌙</button>

          <div className='flex items-center gap-2'>
            <div className='h-9 w-9 rounded-full bg-gray-300'></div> {/**the profile image */}
            <h4>admin user</h4>
          </div>
        </div>
    </div>
  )
}

export default Topbar
import React from 'react'
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {Bell,ChevronDown,Moon,User,Settings,LogOut} from "lucide-react"
import Dropdown from './UI/Dropdown';
import DropdownItem from './UI/DropdownItem';
import { authApi } from '../api/authApi';


const Topbar = () => {
  
  const location=useLocation()
  const navigate=useNavigate();

  const titles = {
    "/": "Dashboard",
    "/doctors": "Doctors",
    "/patients": "Patients",
    "/secretaries": "Secretaries",
    "/statistics": "Statistics",
  };
  const title=titles[location.pathname] || ""
  console.log(location.pathname);

  async function handleLogout(){
    try{
      await authApi.logout();
    } catch(error){
      console.log("error with logout: ",error);
    } finally {
      navigate("/login",{replace:true})
    }

  }
  

  return (
    <div className='h-16 bg-white border-b px-6 flex items-center justify-between'>
        <div>                                   {/**------left side--------- */}
          <h2 className='text-lg font-semibold'>{title}</h2>
        </div>

        <div className='flex items-center gap-3'> {/**------right side--------- */}
          <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell size={19} />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <Moon size={19} />
        </button>

        <Dropdown
          align='right'
          width='w-44'
          trigger={
            <button
              type='button'
              className='flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-100'
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                  A
                </div>

                <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                  Admin User
                </span>

                <ChevronDown size={16} className='text-slate-400'/>

            </button>
          }>
              <DropdownItem onClick={()=>navigate("/profile")}>
                <span className="flex items-center gap-2">
                  <User size={16}></User>
                  Profile
                </span>
              </DropdownItem>



              <DropdownItem onClick={()=>navigate("/settings")}>
                <span className="flex items-center gap-2">
                  <Settings size={16}></Settings>
                  Settings
                </span>
              </DropdownItem>



              <DropdownItem onClick={handleLogout}>
                <span className="flex items-center gap-2">
                  <LogOut size={16}></LogOut>
                  Logout

                </span>
              </DropdownItem>

        </Dropdown>


        
        </div>
    </div>
  )
}

export default Topbar
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Foot from '../components/Foot'
const AdminPageLayout = () => {
  return (
    <div className='flex min-h-screen bg-gray-200' >
        <Sidebar></Sidebar>

        <div className='flex min-h-screen flex-1 flex-col '> {/** Here we have the part after the sidebar where it is Top mean footer. */}

            <Topbar></Topbar>
                <main className='flex-1 p-6'>
                    <Outlet></Outlet>
                </main>
            <Foot></Foot>
        </div>



    </div>
  )
}

export default AdminPageLayout

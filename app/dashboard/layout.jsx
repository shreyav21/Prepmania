

import React from 'react'
import Header from './components/Header'


function DashboardLayout({children}) {
  return (
    <div className="bg-cover bg-center h-[753px] w-full bg-no-repeatflex items-center justify-center" 
    style={{ backgroundImage: "url('/dashboard-bg.png')" }}>

      <Header/> 
      <div className='mx-5 md:mx-20 lg:mx-36'>
    {children}
      </div>
    </div>
  )
}

export default DashboardLayout

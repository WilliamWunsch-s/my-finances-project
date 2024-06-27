import React, { ReactNode } from 'react'

function layout({ children }: {children: ReactNode}) {
  return<div className='relatine flex h-screen w-full flex-col items-center justify-center'>
    {children}      
    </div>
}

export default layout

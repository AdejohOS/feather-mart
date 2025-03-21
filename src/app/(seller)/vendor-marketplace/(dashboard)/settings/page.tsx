import { Profile } from '@/app/(seller)/vendor-marketplace/(dashboard)/settings/_components/profile'
import React from 'react'
import { Farms } from './_components/farms'
import { DangerZone } from './_components/danger-zone'

const page = async () => {
  return (
    <div className='space-y-7'>
      <Profile />

      <Farms />

      <DangerZone />
    </div>
  )
}

export default page

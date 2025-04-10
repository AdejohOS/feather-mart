import React from 'react'
import { FarmForm } from '../../_components/farm-form'
import { PenBox } from 'lucide-react'
import { FormWrapper } from '../../_components/form-wrapper'
import { TaskAction } from '../../_components/task-action'

const page = async ({ params }: { params: Promise<{ farmId: string }> }) => {
  const { farmId } = await params

  return (
    <div className='w-full space-y-7'>
      <TaskAction farmId={farmId} />
      <h1 className='mb-6 flex items-center gap-3 text-3xl font-bold'>
        Update Farm Details
        <PenBox className='size-6' />
      </h1>
      <FormWrapper farmId={farmId} />
    </div>
  )
}

export default page

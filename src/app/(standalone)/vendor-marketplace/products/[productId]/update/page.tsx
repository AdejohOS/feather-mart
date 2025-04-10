import { PenBox } from 'lucide-react'
import { FormWrapper } from '../../_components/form-wrapper'
import { TaskAction } from '../../_components/task-action'

const page = async ({ params }: { params: Promise<{ productId: string }> }) => {
  const { productId } = await params
  return (
    <div className='w-full space-y-7'>
      <TaskAction productId={productId} />
      <h1 className='mb-6 flex items-center gap-3 text-3xl font-bold'>
        Update Product Details
        <PenBox className='size-6' />
      </h1>

      <FormWrapper productId={productId} />
    </div>
  )
}

export default page

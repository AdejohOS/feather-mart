import Sidebar from '@/features/vendor/components/sidebar'
import { UpdateProfileModal } from '@/app/(seller)/vendor-marketplace/(dashboard)/settings/_components/update-profile-modal'
import VendorNavbar from '@/features/vendor/components/vendor-navbar'

interface VendorLayoutProps {
  children: React.ReactNode
}
const VendorLayout = ({ children }: VendorLayoutProps) => {
  return (
    <div className='relative mx-auto flex h-full max-w-6xl p-4'>
      <UpdateProfileModal />

      <div className='sticky top-[150px] hidden h-[calc(100vh-150px)] w-[264px] overflow-y-auto border-r lg:block'>
        <Sidebar />
      </div>

      <div className='flex w-full flex-col'>
        <div className='sticky top-[150px] z-50 w-full bg-white p-4 shadow-md'>
          <VendorNavbar />
        </div>
        <main className='h-full flex-grow px-6 py-8'>{children}</main>
      </div>
    </div>
  )
}

export default VendorLayout

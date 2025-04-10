interface AuthLayoutProps {
  children: React.ReactNode
}

const VendorAuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-6xl p-4'>
        <div className='flex flex-col items-center justify-center pt-4 md:pt-8'>
          {children}
        </div>
      </div>
    </main>
  )
}

export default VendorAuthLayout

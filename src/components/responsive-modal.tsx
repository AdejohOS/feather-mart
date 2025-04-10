import { useMedia } from 'react-use'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer'

interface ResponsiveModalProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}
export const ResponsiveModal = ({
  children,
  open,
  onOpenChange
}: ResponsiveModalProps) => {
  const isDesktop = useMedia('(min-width:1024px)', true)

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:w-lg hide-scrollbar max-h-[85vh] w-full overflow-y-auto border-none p-0'>
          <VisuallyHidden>
            <DialogTitle>Profile form</DialogTitle>
          </VisuallyHidden>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <VisuallyHidden>
          <DrawerTitle>Workspace form</DrawerTitle>
        </VisuallyHidden>
        <div className='hide-scrollbar max-h-[85vh] overflow-y-auto'>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

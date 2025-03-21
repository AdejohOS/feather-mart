import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
interface ModalProps {
  children: React.ReactNode
  title: string
  description: string
  isOpen: boolean
  onClose: () => void
}
export const Modal = ({
  title,
  description,
  children,
  isOpen,
  onClose
}: ModalProps) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <>{children}</>
      </DialogContent>
    </Dialog>
  )
}

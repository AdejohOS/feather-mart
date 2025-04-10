import { useQueryState, parseAsBoolean } from 'nuqs'

export const useCreateFarmModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-farm',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  )
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return {
    isOpen,
    open,
    close,
    setIsOpen
  }
}

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useModal } from '@/providers/modal-provider'

import React from 'react'
import { Button } from '../ui/button'

type Props = {
  title: string
  subheading: string
  children: React.ReactNode
  defaultOpen?: boolean
}

const CustomModal = ({ children, subheading, title, defaultOpen }: Props) => {
  const { isOpen, setClose } = useModal()
  const handleClose = () => setClose()

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
    >
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center">{title}</DrawerTitle>
          <DrawerDescription className="text-center">
            {subheading}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
        <DrawerFooter className="flex flex-col gap-4 bg-background border-t-[1px] border-t-muted">
          <DrawerClose>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleClose}
            >
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CustomModal

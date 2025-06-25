'use client'

import Workflowform from '@/components/forms/workflow-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { useBilling } from '@/providers/billing-provider'
import { useModal } from '@/providers/modal-provider'
import { Plus, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import AiWorkflowBuilder from './ai-workflow-builder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Props = {}

const WorkflowButton = (props: Props) => {
  const { setOpen, setClose } = useModal()
  const { credits } = useBilling()
  const [activeTab, setActiveTab] = useState<string>('manual')

  const handleClick = () => {
    setOpen(
      <CustomModal
        title="Create a Workflow Automation"
        subheading="Choose how you want to create your workflow"
      >
        <Tabs
          defaultValue="manual"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Manual Builder
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              AI Builder
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <Workflowform 
              title="New Workflow"
              subTitle="Create a new workflow to automate your tasks"
            />
          </TabsContent>
          <TabsContent value="ai">
            <AiWorkflowBuilder />
          </TabsContent>
        </Tabs>
      </CustomModal>
    )
  }

  return (
    <Button
      size={'icon'}
      {...(credits !== '0'
        ? {
            onClick: handleClick,
          }
        : {
            disabled: true,
          })}
    >
      <Plus />
    </Button>
  )
}

export default WorkflowButton

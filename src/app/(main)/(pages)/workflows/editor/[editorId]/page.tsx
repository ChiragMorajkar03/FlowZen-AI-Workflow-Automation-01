import React from 'react'
import EditorCanvas from './_components/editor-canvas'
import { ConnectionsProvider } from '@/providers/connections-provider'
import EditorProvider from '@/providers/editor-provider'
import { getWorkflowById } from '../../_actions/workflow-connections'
import { auth } from '@clerk/nextjs'

type Props = {
  params: {
    editorId: string
  }
}

const Page = async ({ params }: Props) => {
  const { userId } = auth()
  const workflowId = params.editorId
  
  // Fetch workflow data
  const workflowData = await getWorkflowById(workflowId)
  
  return (
    <div className="h-full">
      <EditorProvider>
        <ConnectionsProvider>
          <EditorCanvas workflowData={workflowData} />
        </ConnectionsProvider>
      </EditorProvider>
    </div>
  )
}

export default Page

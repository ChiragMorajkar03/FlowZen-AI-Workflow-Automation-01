'use client'
import { EditorCanvasTypes, EditorNodeType, nodeMapper } from '@/lib/types'
import { useNodeConnections } from '@/providers/connections-provider'
import { useEditor } from '@/providers/editor-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import React, { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { CONNECTIONS, EditorCanvasDefaultCardTypes } from '@/lib/constant'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  fetchBotSlackChannels,
  onConnections,
  onDragStart,
} from '@/lib/editor-utils'
import EditorCanvasIconHelper from './editor-canvas-card-icon-hepler'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import RenderConnectionAccordion from './render-connection-accordion'
import RenderOutputAccordion from './render-output-accordian'
import { useFuzzieStore } from '@/store'
import GitHubActions from './github-actions'
import EmailActions from './email-actions'
import TeamCollaborationPanel from './team-collaboration-panel'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

type Props = {
  nodes: EditorNodeType[]
  workflowData?: {
    id: string
    teamId?: string
    visibility?: string
    userId: string
  }
}

const EditorCanvasSidebar = ({ nodes, workflowData }: Props) => {
  const { state } = useEditor()
  const { nodeConnection } = useNodeConnections()
  const { googleFile, setSlackChannels } = useFuzzieStore()
  const { user } = useUser()
  const pathname = usePathname()
  const [refreshKey, setRefreshKey] = useState(0)
  
  const isWorkflowOwner = workflowData?.userId === user?.id
  
  useEffect(() => {
    if (state) {
      onConnections(nodeConnection, state, googleFile)
    }
  }, [state])

  useEffect(() => {
    if (nodeConnection.slackNode.slackAccessToken) {
      fetchBotSlackChannels(
        nodeConnection.slackNode.slackAccessToken,
        setSlackChannels
      )
    }
  }, [nodeConnection])

  const getRelevantConnection = () => {
    if (!state.editor.selectedNode) return null;
    
    const nodeType = state.editor.selectedNode.type;
    const connectionKey = nodeMapper[nodeType];
    
    if (!connectionKey) return null;

    return CONNECTIONS.find(conn => conn.connectionKey === connectionKey);
  }

  const handleWorkflowUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="flex flex-col h-full">
      {workflowData && (
        <div className="px-2 mb-2">
          <TeamCollaborationPanel 
            workflowId={workflowData.id}
            teamId={workflowData.teamId}
            visibility={workflowData.visibility}
            isOwner={!!isWorkflowOwner}
            onUpdate={handleWorkflowUpdate}
          />
        </div>
      )}
      
      <Tabs defaultValue="blocks" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="blocks" className="w-full">
            Blocks
          </TabsTrigger>
          <TabsTrigger value="connections" className="w-full">
            Connections
          </TabsTrigger>
        </TabsList>
        <TabsContent value="blocks" className="flex flex-col gap-4 p-4">
          {Object.entries(EditorCanvasDefaultCardTypes)
            .filter(
              ([_, cardType]) =>
                (!nodes.length && cardType.type === 'Trigger') ||
                (nodes.length && cardType.type === 'Action')
            )
            .map(([cardKey, cardValue]) => (
              <Card
                key={cardKey}
                draggable
                className="w-full cursor-grab border-black bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900"
                onDragStart={(event) =>
                  onDragStart(event, cardKey as EditorCanvasTypes)
                }
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <EditorCanvasIconHelper type={cardKey as EditorCanvasTypes} />
                  <div>
                    <CardTitle className="text-md">
                      {cardKey}
                    </CardTitle>
                    <CardDescription>
                      {cardValue.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="connections" className="px-2">
          {state.editor.selectedNode && (
            <Accordion type="multiple">
              {getRelevantConnection() && (
                <AccordionItem
                  value="Options"
                  className="border-y-[1px] px-2"
                >
                  <AccordionTrigger className="!no-underline">
                    Account
                  </AccordionTrigger>
                  <AccordionContent>
                    <RenderConnectionAccordion
                      connection={getRelevantConnection()!}
                      state={state}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem
                value="Expected Output"
                className="px-2"
              >
                <AccordionTrigger className="!no-underline">
                  Action
                </AccordionTrigger>
                <AccordionContent>
                  {state.editor.selectedNode.type === 'GitHub' && <GitHubActions />}
                  {state.editor.selectedNode.type === 'Email' && <EmailActions />}
                  {state.editor.selectedNode.type !== 'GitHub' && state.editor.selectedNode.type !== 'Email' && (
                    <RenderOutputAccordion
                      state={state}
                      nodeConnection={nodeConnection}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EditorCanvasSidebar

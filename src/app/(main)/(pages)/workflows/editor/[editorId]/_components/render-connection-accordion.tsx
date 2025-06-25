'use client'
import React from 'react'
import ConnectionCard from '@/app/(main)/(pages)/connections/_components/connection-card'
import { AccordionContent } from '@/components/ui/accordion'
import { Connection } from '@/lib/types'
import { useNodeConnections } from '@/providers/connections-provider'
import { EditorState } from '@/providers/editor-provider'
import { useFuzzieStore, Option } from '@/store'
import { Button } from '@/components/ui/button'

type Props = {
  connection: Connection
  state: EditorState
}

const RenderConnectionAccordion = ({ connection, state }: Props) => {
  const { nodeConnection } = useNodeConnections()
  const { slackChannels, selectedSlackChannels, setSelectedSlackChannels } = useFuzzieStore()

  const isConnected = React.useMemo(() => {
    if (connection.alwaysTrue) return true
    if (!connection.connectionKey || !connection.accessTokenKey) return false

    const node = nodeConnection[connection.connectionKey as keyof typeof nodeConnection]
    if (!node || typeof node !== 'object') return false

    return Boolean((node as any)[connection.accessTokenKey])
  }, [connection, nodeConnection])

  const handleSlackChannelChange = (channelId: string) => {
    const channel = slackChannels.find(ch => ch.value === channelId)
    if (channel) {
      setSelectedSlackChannels([channel])
    }
  }

  const selectedChannelId = React.useMemo(() => {
    if (!Array.isArray(selectedSlackChannels) || selectedSlackChannels.length === 0) return ''
    return selectedSlackChannels[0].value
  }, [selectedSlackChannels])

  return (
    <div className="flex flex-col gap-4">
      <ConnectionCard
        title={connection.title}
        description={connection.description}
        image={connection.image}
        isConnected={isConnected}
      />
      {connection.slackSpecial && isConnected && Array.isArray(slackChannels) && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Select Slack Channels</label>
          <select
            className="w-full rounded-md border p-2"
            value={selectedChannelId}
            onChange={(e) => handleSlackChannelChange(e.target.value)}
          >
            <option value="">Select a channel</option>
            {slackChannels.map((channel: Option) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default RenderConnectionAccordion

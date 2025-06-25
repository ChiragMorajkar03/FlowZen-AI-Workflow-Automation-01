'use client'

import { CONNECTIONS } from '@/lib/constant'
import React, { useEffect, useState } from 'react'
import ConnectionCard from './_components/connection-card'
import { useUser } from '@clerk/nextjs'
import { getUserData } from './_actions/get-user'

const Connections = () => {
  const { user } = useUser()
  const [connections, setConnections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user?.id) return

      try {
        const userData = await getUserData(user.id)
        const connectionStates: Record<string, boolean> = {}

        // Map existing connections
        userData?.connections.forEach((connection) => {
          connectionStates[connection.type] = true
        })

        // Google Drive is always connected through login
        connectionStates['Google Drive'] = true

        setConnections(connectionStates)
      } catch (error) {
        console.error('Error fetching connections:', error)
      }
    }

    fetchConnections()
  }, [user?.id])

  if (!user) return null

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Connections</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONNECTIONS.map((connection) => (
          <ConnectionCard
            key={connection.title}
            description={connection.description}
            title={connection.title}
            image={connection.image}
            isConnected={connections[connection.title] || false}
          />
        ))}
      </div>
    </div>
  )
}

export default Connections

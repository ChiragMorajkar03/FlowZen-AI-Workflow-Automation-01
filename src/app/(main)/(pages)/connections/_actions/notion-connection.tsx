'use server'

import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs'
import { Client } from '@notionhq/client'

/** ✅ Handles Notion Connection */
export const onNotionConnect = async (
  access_token: string,
  workspace_id: string,
  workspace_icon: string,
  workspace_name: string,
  database_id: string,
  id: string
) => {
  'use server'

  console.log('🔄 Attempting Notion connection for user:', id)

  // ✅ Check for required fields
  if (!access_token) {
    console.error('❌ Missing access token!')
    return { error: 'Access token is required' }
  }

  if (!id) {
    console.error('❌ User ID is missing!')
    return { error: 'User ID is required' }
  }

  // ✅ Check if Notion is already connected
  const notion_connected = await db.notion.findFirst({
    where: { userId: id },
  })

  console.log('🔍 Existing Notion connection:', notion_connected)

  if (!notion_connected) {
    console.log('⏳ Creating new Notion connection...')
    try {
      const newConnection = await db.notion.create({
        data: {
          userId: id,
          workspaceIcon: workspace_icon || '',
          accessToken: access_token,
          workspaceId: workspace_id || '',
          workspaceName: workspace_name || '',
          databaseId: database_id || '',
          connections: {
            create: {
              userId: id,
              type: 'Notion',
            },
          },
        },
      })

      console.log('✅ Notion connection created:', newConnection)
      return { success: true, connection: newConnection }
    } catch (error) {
      console.error('🚨 Error creating Notion connection:', error)
      return { error: 'Failed to create Notion connection' }
    }
  } else {
    console.log('⚠️ Notion connection already exists!')
    return { message: 'Notion is already connected', connection: notion_connected }
  }
}

/** ✅ Fetch Notion Connection */
export const getNotionConnection = async () => {
  const user = await currentUser()
  if (!user) {
    console.error('❌ No authenticated user found!')
    return null
  }

  console.log('🔄 Fetching Notion connection for user:', user.id)
  const connection = await db.notion.findFirst({
    where: { userId: user.id },
  })

  if (!connection) {
    console.warn('⚠️ No Notion connection found for this user')
  }

  return connection
}

/** ✅ Fetch Notion Database */
export const getNotionDatabase = async (databaseId: string, accessToken: string) => {
  try {
    console.log('🔍 Fetching Notion database:', databaseId)

    const notion = new Client({ auth: accessToken })
    const response = await notion.databases.retrieve({ database_id: databaseId })

    console.log('✅ Notion Database Retrieved:', response)
    return response
  } catch (error) {
    console.error('🚨 Error fetching Notion database:', error)
    return { error: 'Failed to retrieve Notion database' }
  }
}

interface NotionPageProperties {
  title: string;
  type: string;
  size: number;
  lastModified: string;
  description: string;
  fileUrl?: string;
  previewUrl?: string;
}

/** ✅ Create a New Page in Notion Database */
export const onCreateNewPageInDatabase = async (
  databaseId: string,
  accessToken: string,
  content: string
) => {
  try {
    console.log('📝 Creating new Notion page in database:', databaseId)

    const notion = new Client({ auth: accessToken })
    const response = await notion.pages.create({
      parent: { type: 'database_id', database_id: databaseId },
      properties: {
        title: [
          {
            text: { content },
          },
        ],
      },
    })

    console.log('✅ Notion Page Created:', response)
    return response
  } catch (error) {
    console.error('🚨 Error creating Notion page:', error)
    return { error: 'Failed to create Notion page' }
  }
}

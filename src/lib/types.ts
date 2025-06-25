import { z } from 'zod'
import { Dispatch, SetStateAction } from 'react'

export const EditUserProfileSchema = z.object({
  email: z.string().email('Required'),
  name: z.string().min(1, 'Required'),
})

export const WorkflowFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
})

export type ConnectionTypes =
  | 'Google Drive'
  | 'Discord'
  | 'Slack'
  | 'Notion'
  | 'Email'
  | 'GitHub'

export type Connection = {
  title: string
  description: string
  image: string
  connectionKey: string
  accessTokenKey?: string
  alwaysTrue?: boolean
  slackSpecial?: boolean
}

export type WorkflowTemplate = {
  discord?: string
  notion?: string
  slack?: string
}

export type ConnectionProviderProps = {
  googleNode: any[]
  discordNode: {
    webhookURL: string
    content: string
    webhookName: string
    guildName: string
  }
  notionNode: {
    accessToken: string
    databaseId: string
    workspaceName: string
    content: any
  }
  slackNode: {
    appId: string
    authedUserId: string
    authedUserToken: string
    slackAccessToken: string
    botUserId: string
    teamId: string
    teamName: string
    content: string
  }
  emailNode: {
    email: string
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPass: string
  }
  githubNode: {
    token: string
  }
  isLoading: boolean
  workflowTemplate: WorkflowTemplate
  setGoogleNode: Dispatch<SetStateAction<any[]>>
  setDiscordNode: Dispatch<SetStateAction<any>>
  setNotionNode: Dispatch<SetStateAction<any>>
  setSlackNode: Dispatch<SetStateAction<any>>
  setEmailNode: Dispatch<SetStateAction<any>>
  setGitHubNode: Dispatch<SetStateAction<any>>
  setIsLoading: Dispatch<SetStateAction<boolean>>
  setWorkFlowTemplate: Dispatch<SetStateAction<WorkflowTemplate>>
}

export type EditorCanvasTypes =
  | 'Email'
  | 'Condition'
  | 'AI'
  | 'Slack'
  | 'Google Drive'
  | 'Notion'
  | 'GitHub'
  | 'Custom Webhook'
  | 'Google Calendar'
  | 'Trigger'
  | 'Action'
  | 'Wait'

export type EditorCanvasCardType = {
  title: string
  description: string
  completed: boolean
  current: boolean
  metadata: any
  type: EditorCanvasTypes
}

export type EditorNodeType = {
  id: string
  type: EditorCanvasCardType['type']
  position: {
    x: number
    y: number
  }
  data: EditorCanvasCardType
}

export type EditorNode = EditorNodeType

export type EditorActions =
  | {
      type: 'LOAD_DATA'
      payload: {
        elements: EditorNode[]
        edges: {
          id: string
          source: string
          target: string
        }[]
      }
    }
  | {
      type: 'UPDATE_NODE'
      payload: {
        elements: EditorNode[]
      }
    }
  | { type: 'REDO' }
  | { type: 'UNDO' }
  | {
      type: 'SELECTED_ELEMENT'
      payload: {
        element: EditorNode
      }
    }

export const nodeMapper: Record<string, string> = {
  Notion: 'notionNode',
  Slack: 'slackNode',
  Discord: 'discordNode',
  'Google Drive': 'googleNode',
  Email: 'emailNode',
  Condition: 'conditionNode',
  AI: 'aiNode',
  'Custom Webhook': 'webhookNode',
  'Google Calendar': 'calendarNode',
  Trigger: 'triggerNode',
  Action: 'actionNode',
  Wait: 'waitNode',
}

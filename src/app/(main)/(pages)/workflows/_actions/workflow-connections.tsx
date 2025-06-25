'use server'
import { Option } from '@/components/ui/multiple-selector'
import { db } from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs'
import { z } from 'zod'
import { WorkflowFormSchema } from '@/lib/types'
import { createGitHubIssue, commitFileToRepo } from '../../connections/_actions/github-connection'

export const getGoogleListener = async () => {
  const { userId } = auth()

  if (userId) {
    const listener = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        googleResourceId: true,
      },
    })

    if (listener) return listener
  }
}

export const onFlowPublish = async (workflowId: string, state: boolean) => {
  console.log(state)
  const published = await db.workflows.update({
    where: {
      id: workflowId,
    },
    data: {
      publish: state,
    },
  })

  if (published.publish) return 'Workflow published'
  return 'Workflow unpublished'
}

export const onCreateNodeTemplate = async (
  content: string,
  type: string,
  workflowId: string,
  channels?: Option[],
  accessToken?: string,
  notionDbId?: string,
  config?: any
) => {
  if (type === 'Discord') {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        discordTemplate: content,
      },
    })

    if (response) {
      return 'Discord template saved'
    }
  }
  if (type === 'Slack') {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        slackTemplate: content,
        slackAccessToken: accessToken,
      },
    })

    if (response) {
      const channelList = await db.workflows.findUnique({
        where: {
          id: workflowId,
        },
        select: {
          slackChannels: true,
        },
      })

      if (channelList) {
        //remove duplicates before insert
        const NonDuplicated = channelList.slackChannels.filter(
          (channel) => channel !== channels![0].value
        )

        NonDuplicated!
          .map((channel) => channel)
          .forEach(async (channel) => {
            await db.workflows.update({
              where: {
                id: workflowId,
              },
              data: {
                slackChannels: {
                  push: channel,
                },
              },
            })
          })

        return 'Slack template saved'
      }
      channels!
        .map((channel) => channel.value)
        .forEach(async (channel) => {
          await db.workflows.update({
            where: {
              id: workflowId,
            },
            data: {
              slackChannels: {
                push: channel,
              },
            },
          })
        })
      return 'Slack template saved'
    }
  }

  if (type === 'Notion') {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        notionTemplate: content,
        notionAccessToken: accessToken,
        notionDbId: notionDbId,
      },
    })

    if (response) return 'Notion template saved'
  }

  if (type === 'Email') {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        emailTemplate: content,
        emailConfig: JSON.stringify(config),
      },
    })

    if (response) return 'Email template saved'
  }

  if (type === 'GitHub') {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        githubTemplate: content,
        githubConfig: JSON.stringify(config),
      },
    })

    if (response) {
      const { action, repository, title, body, path, content: fileContent, message } = config
      const [owner, repo] = repository.split('/')

      if (action === 'create_issue') {
        await createGitHubIssue(accessToken!, owner, repo, title, body)
      } else if (action === 'commit_file') {
        await commitFileToRepo(accessToken!, owner, repo, path, fileContent, message)
      }

      return 'GitHub action executed successfully'
    }
  }
}

export const onGetWorkflows = async () => {
  const user = await currentUser()
  if (user) {
    const workflow = await db.workflows.findMany({
      where: {
        userId: user.id,
      },
    })

    if (workflow) return workflow
  }
}

export const onCreateWorkflow = async (
  values: z.infer<typeof WorkflowFormSchema>
) => {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      console.error('User not authenticated')
      return { message: 'User not found' }
    }

    // First, ensure the user exists in the database
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    })

    // If user doesn't exist in the database, create them
    if (!dbUser) {
      console.log('Creating new user in database with clerkId:', userId)
      dbUser = await db.user.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          profileImage: user.imageUrl || '',
        }
      })
    }

    // Now create the workflow with the verified user
    const workflow = await db.workflows.create({
      data: {
        name: values.name,
        description: values.description || '',
        userId: dbUser.clerkId, // Use the clerkId from the database user
      },
    })

    if (workflow) {
      console.log('Workflow created successfully:', workflow.id)
      return { 
        message: 'Workflow created successfully',
        workflow: workflow
      }
    }
    
    console.error('Failed to create workflow - database operation failed')
    return { message: 'Failed to create workflow' }
  } catch (error) {
    console.error('Error creating workflow:', error)
    return { message: 'Failed to create workflow' }
  }
}

export const onGetNodesEdges = async (flowId: string) => {
  const nodesEdges = await db.workflows.findUnique({
    where: {
      id: flowId,
    },
    select: {
      nodes: true,
      edges: true,
    },
  })

  if (nodesEdges?.nodes && nodesEdges?.edges) return nodesEdges
  return null
}

export const getWorkflowById = async (workflowId: string) => {
  const { userId } = auth()
  
  if (!userId || !workflowId) return null
  
  try {
    const workflow = await db.workflows.findUnique({
      where: {
        id: workflowId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        userId: true,
        teamId: true,
        visibility: true,
        publish: true,
        createdAt: true,
        updatedAt: true,
        team: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                userId: true,
                role: true,
              }
            }
          }
        }
      },
    })
    
    return workflow
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return null
  }
}

'use server'

import { db } from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { WorkflowFormSchema } from '@/lib/types'

// Get all team workflows for a specific team
export async function getTeamWorkflows(teamId: string) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Check if user is a member of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        teamId,
        userId
      }
    })

    if (!teamMember) {
      throw new Error('Not a member of this team')
    }

    // Get all team workflows
    const workflows = await db.workflows.findMany({
      where: {
        teamId,
        visibility: {
          in: ['team', 'public']
        }
      },
      orderBy: {
        lastModified: 'desc'
      }
    })

    return workflows
  } catch (error) {
    console.error('Error fetching team workflows:', error)
    throw new Error('Failed to fetch team workflows')
  }
}

// Create a new workflow for a team
export async function createTeamWorkflow(
  teamId: string,
  values: z.infer<typeof WorkflowFormSchema>,
  visibility: string = 'team'
) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user has permission to create workflows
    const teamMember = await db.teamMember.findFirst({
      where: {
        teamId,
        userId,
        canCreateWorkflows: true
      }
    })

    if (!teamMember) {
      throw new Error('You do not have permission to create workflows for this team')
    }

    // Create the workflow
    const workflow = await db.workflows.create({
      data: {
        name: values.name,
        description: values.description,
        userId: user.id,
        team: {
          connect: {
            id: teamId
          }
        },
        visibility
      }
    })

    revalidatePath(`/teams/${teamId}`)
    return { message: 'Team workflow created successfully', workflow }
  } catch (error) {
    console.error('Error creating team workflow:', error)
    throw new Error('Failed to create team workflow')
  }
}

// Update a team workflow
export async function updateTeamWorkflow(
  workflowId: string,
  data: {
    name?: string;
    description?: string;
    visibility?: string;
    nodes?: string;
    edges?: string;
  }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Get the workflow to check team and permissions
    const workflow = await db.workflows.findUnique({
      where: {
        id: workflowId
      },
      include: {
        team: {
          include: {
            members: {
              where: {
                userId
              }
            }
          }
        }
      }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    if (!workflow.teamId) {
      throw new Error('Not a team workflow')
    }

    // Check if user has permission to edit workflows
    const teamMember = workflow.team?.members[0]
    
    if (!teamMember || (!teamMember.canEditWorkflows && workflow.userId !== userId)) {
      throw new Error('You do not have permission to edit this workflow')
    }

    // Update the workflow
    const updatedWorkflow = await db.workflows.update({
      where: {
        id: workflowId
      },
      data: {
        ...data,
        lastModified: new Date()
      }
    })

    revalidatePath(`/teams/${workflow.teamId}`)
    revalidatePath(`/workflows/editor/${workflowId}`)
    
    return { message: 'Workflow updated successfully', workflow: updatedWorkflow }
  } catch (error) {
    console.error('Error updating team workflow:', error)
    throw new Error('Failed to update team workflow')
  }
}

// Delete a team workflow
export async function deleteTeamWorkflow(workflowId: string) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Get the workflow to check team and permissions
    const workflow = await db.workflows.findUnique({
      where: {
        id: workflowId
      },
      include: {
        team: {
          include: {
            members: {
              where: {
                userId
              }
            }
          }
        }
      }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    if (!workflow.teamId) {
      throw new Error('Not a team workflow')
    }

    // Check if user has permission to delete workflows
    const teamMember = workflow.team?.members[0]
    
    if (!teamMember || (!teamMember.canDeleteWorkflows && workflow.userId !== userId)) {
      throw new Error('You do not have permission to delete this workflow')
    }

    // Delete the workflow
    await db.workflows.delete({
      where: {
        id: workflowId
      }
    })

    revalidatePath(`/teams/${workflow.teamId}`)
    return { message: 'Workflow deleted successfully' }
  } catch (error) {
    console.error('Error deleting team workflow:', error)
    throw new Error('Failed to delete team workflow')
  }
}

// Share a workflow with a team
export async function shareWorkflowWithTeam(workflowId: string, teamId: string, visibility: string = 'team') {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Get the workflow
    const workflow = await db.workflows.findUnique({
      where: {
        id: workflowId,
        userId // Ensure the user owns this workflow
      }
    })

    if (!workflow) {
      throw new Error('Workflow not found or you do not have permission')
    }

    // Check if user is a member of the target team
    const teamMember = await db.teamMember.findFirst({
      where: {
        teamId,
        userId
      }
    })

    if (!teamMember) {
      throw new Error('You are not a member of this team')
    }

    // Update the workflow to be associated with the team
    const updatedWorkflow = await db.workflows.update({
      where: {
        id: workflowId
      },
      data: {
        team: {
          connect: {
            id: teamId
          }
        },
        visibility,
        lastModified: new Date()
      }
    })

    revalidatePath(`/teams/${teamId}`)
    return { message: 'Workflow shared with team successfully', workflow: updatedWorkflow }
  } catch (error) {
    console.error('Error sharing workflow with team:', error)
    throw new Error('Failed to share workflow with team')
  }
}

// Clone a workflow for personal use or for another team
export async function cloneWorkflow(workflowId: string, teamId?: string) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      throw new Error('Unauthorized')
    }

    // Get the original workflow
    const originalWorkflow = await db.workflows.findUnique({
      where: {
        id: workflowId
      }
    })

    if (!originalWorkflow) {
      throw new Error('Workflow not found')
    }

    // If teamId is provided, check if user has permission to create workflows for this team
    if (teamId) {
      const teamMember = await db.teamMember.findFirst({
        where: {
          teamId,
          userId,
          canCreateWorkflows: true
        }
      })

      if (!teamMember) {
        throw new Error('You do not have permission to create workflows for this team')
      }
    }

    // Create a new workflow based on the original
    const clonedWorkflow = await db.workflows.create({
      data: {
        name: `${originalWorkflow.name} (Clone)`,
        description: originalWorkflow.description,
        nodes: originalWorkflow.nodes,
        edges: originalWorkflow.edges,
        discordTemplate: originalWorkflow.discordTemplate,
        notionTemplate: originalWorkflow.notionTemplate,
        slackTemplate: originalWorkflow.slackTemplate,
        emailTemplate: originalWorkflow.emailTemplate,
        githubTemplate: originalWorkflow.githubTemplate,
        slackChannels: originalWorkflow.slackChannels,
        isTemplate: false,
        visibility: 'private',
        userId: user.id,
        ...(teamId ? {
          team: {
            connect: {
              id: teamId
            }
          }
        } : {})
      }
    })

    if (teamId) {
      revalidatePath(`/teams/${teamId}`)
    }
    revalidatePath('/workflows')
    
    return { message: 'Workflow cloned successfully', workflow: clonedWorkflow }
  } catch (error) {
    console.error('Error cloning workflow:', error)
    throw new Error('Failed to clone workflow')
  }
}

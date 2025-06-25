'use server'

import { db } from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'
import { generateWorkflowFromPrompt } from '@/lib/ai-workflow-generator'

/**
 * Creates a workflow using AI based on a natural language prompt
 * @param prompt User's natural language description of the desired workflow
 * @returns Object with success status, message, and workflow ID if successful
 */
export async function createAiWorkflow(prompt: string) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      console.error('User not authenticated')
      return { 
        success: false, 
        message: 'User not authenticated' 
      }
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

    // Generate workflow configuration using AI
    const workflowConfig = await generateWorkflowFromPrompt(prompt)
    
    if (!workflowConfig) {
      return {
        success: false,
        message: 'Failed to generate workflow configuration'
      }
    }

    // Create the workflow in the database
    const workflow = await db.workflows.create({
      data: {
        name: workflowConfig.name,
        description: workflowConfig.description,
        userId: dbUser.clerkId,
        nodes: JSON.stringify(workflowConfig.nodes || []),
        edges: JSON.stringify(workflowConfig.edges || []),
        // Add any other workflow configuration fields
      },
    })

    if (!workflow) {
      return {
        success: false,
        message: 'Failed to create workflow in database'
      }
    }

    // Revalidate relevant paths
    revalidatePath('/workflows')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Workflow created successfully',
      workflowId: workflow.id
    }
  } catch (error) {
    console.error('Error creating AI workflow:', error)
    return {
      success: false,
      message: 'An error occurred while creating the workflow'
    }
  }
}

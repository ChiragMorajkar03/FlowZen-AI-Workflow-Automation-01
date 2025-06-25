import { v4 as uuidv4 } from 'uuid'

/**
 * Interface for workflow configuration generated from AI
 */
export interface WorkflowConfig {
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

/**
 * Interface for a workflow node
 */
export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    title: string
    description: string
    completed: boolean
    current: boolean
    metadata: any
    type: string
  }
}

/**
 * Interface for a workflow edge
 */
export interface WorkflowEdge {
  id: string
  source: string
  target: string
}

/**
 * Generates a workflow configuration from a natural language prompt
 * @param prompt User's natural language description of the desired workflow
 * @returns WorkflowConfig object or null if generation fails
 */
export async function generateWorkflowFromPrompt(prompt: string): Promise<WorkflowConfig | null> {
  try {
    // Extract key information from the prompt
    const workflowInfo = analyzePrompt(prompt)
    
    // Generate nodes and edges based on the analysis
    const nodes = generateNodes(workflowInfo)
    const edges = generateEdges(nodes)
    
    return {
      name: workflowInfo.name,
      description: workflowInfo.description,
      nodes,
      edges
    }
  } catch (error) {
    console.error('Error generating workflow from prompt:', error)
    return null
  }
}

/**
 * Analyzes the prompt to extract key information
 */
interface WorkflowInfo {
  name: string
  description: string
  trigger: string
  actions: string[]
  services: string[]
}

function analyzePrompt(prompt: string): WorkflowInfo {
  // Default values
  let workflowInfo: WorkflowInfo = {
    name: 'AI Generated Workflow',
    description: prompt,
    trigger: 'Manual',
    actions: [],
    services: []
  }
  
  // Extract workflow name
  if (prompt.toLowerCase().includes('create a workflow') || prompt.toLowerCase().includes('build a workflow')) {
    const nameParts = prompt.match(/create a workflow (that|to|which) (.*?)(?:\.|\n|$)/i) || 
                     prompt.match(/build a workflow (that|to|which) (.*?)(?:\.|\n|$)/i)
    
    if (nameParts && nameParts[2]) {
      workflowInfo.name = capitalizeFirstLetter(nameParts[2].trim())
    }
  }
  
  // Identify services mentioned in the prompt
  const possibleServices = [
    'GitHub', 'Slack', 'Discord', 'Email', 'Google Drive', 
    'Google Calendar', 'Notion', 'Custom Webhook'
  ]
  
  possibleServices.forEach(service => {
    if (prompt.toLowerCase().includes(service.toLowerCase())) {
      workflowInfo.services.push(service)
    }
  })
  
  // Identify trigger and actions
  if (workflowInfo.services.includes('GitHub') && 
      (prompt.toLowerCase().includes('new issue') || prompt.toLowerCase().includes('issues'))) {
    workflowInfo.trigger = 'GitHub'
    workflowInfo.actions.push('Slack')
  } else if (workflowInfo.services.includes('Google Calendar') && 
            prompt.toLowerCase().includes('calendar')) {
    workflowInfo.trigger = 'Google Calendar'
    workflowInfo.actions.push('Email')
  } else if (workflowInfo.services.includes('Email') && 
            prompt.toLowerCase().includes('email')) {
    workflowInfo.trigger = 'Email'
    if (workflowInfo.services.includes('Google Drive')) {
      workflowInfo.actions.push('Google Drive')
    }
  } else if (workflowInfo.services.includes('GitHub') && 
            prompt.toLowerCase().includes('pr') || prompt.toLowerCase().includes('pull request')) {
    workflowInfo.trigger = 'GitHub'
    if (workflowInfo.services.includes('Discord')) {
      workflowInfo.actions.push('Discord')
    } else {
      workflowInfo.actions.push('Slack')
    }
  }
  
  return workflowInfo
}

/**
 * Generates workflow nodes based on the analyzed information
 */
function generateNodes(workflowInfo: WorkflowInfo): WorkflowNode[] {
  const nodes: WorkflowNode[] = []
  
  // Create trigger node
  const triggerId = uuidv4()
  nodes.push({
    id: triggerId,
    type: workflowInfo.trigger,
    position: { x: 250, y: 100 },
    data: {
      title: `${workflowInfo.trigger} Trigger`,
      description: `Trigger from ${workflowInfo.trigger}`,
      completed: false,
      current: false,
      metadata: {},
      type: workflowInfo.trigger
    }
  })
  
  // Create action nodes
  let yPosition = 250
  workflowInfo.actions.forEach(action => {
    const actionId = uuidv4()
    nodes.push({
      id: actionId,
      type: action,
      position: { x: 250, y: yPosition },
      data: {
        title: `${action} Action`,
        description: `Action for ${action}`,
        completed: false,
        current: false,
        metadata: {},
        type: action
      }
    })
    yPosition += 150
  })
  
  return nodes
}

/**
 * Generates edges between nodes
 */
function generateEdges(nodes: WorkflowNode[]): WorkflowEdge[] {
  const edges: WorkflowEdge[] = []
  
  // Connect nodes sequentially
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: uuidv4(),
      source: nodes[i].id,
      target: nodes[i + 1].id
    })
  }
  
  return edges
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

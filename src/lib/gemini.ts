import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export interface WorkflowData {
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  connections: any[];
}

function analyzeWorkflowComponents(workflowData: WorkflowData) {
  const nodeTypes = new Set(workflowData.nodes.map(node => node.type));
  const connectionTypes = new Set(workflowData.connections.map(conn => conn.type));
  
  return {
    nodeTypes: Array.from(nodeTypes),
    connectionTypes: Array.from(connectionTypes),
    nodeCount: workflowData.nodes.length,
    edgeCount: workflowData.edges.length,
    connectionCount: workflowData.connections.length
  };
}

export async function generateDocumentation(workflowData: WorkflowData) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const workflowAnalysis = analyzeWorkflowComponents(workflowData);

    const prompt = `Generate detailed, workflow-specific documentation for an automation system. Analyze the following workflow components and generate comprehensive documentation that is specific to this workflow's structure and components.

Workflow Name: ${workflowData.name}
Description: ${workflowData.description}

Workflow Analysis:
- Node Types: ${workflowAnalysis.nodeTypes.join(', ')}
- Connection Types: ${workflowAnalysis.connectionTypes.join(', ')}
- Total Nodes: ${workflowAnalysis.nodeCount}
- Total Edges: ${workflowAnalysis.edgeCount}
- Total Connections: ${workflowAnalysis.connectionCount}

Detailed Workflow Structure:
Nodes:
${workflowData.nodes.map(node => `- ${node.type}: ${JSON.stringify(node.data)}`).join('\n')}

Edges:
${workflowData.edges.map(edge => `- ${edge.source} -> ${edge.target}`).join('\n')}

Connections:
${workflowData.connections.map(conn => `- ${conn.type}: ${JSON.stringify(conn)}`).join('\n')}

Please generate detailed documentation in markdown format with the following sections, making sure to reference specific components and their interactions:

1. Workflow Overview
   - Purpose and Goals
   - Key Components and Their Roles
   - Data Flow Description
   - Integration Points

2. Component Details
   - Detailed description of each node type and its purpose
   - How nodes interact with each other
   - Specific configuration requirements for each component
   - Data transformation and processing at each step

3. Connection Setup
   - Required services and their configuration
   - Authentication and authorization requirements
   - API endpoints and data formats
   - Connection-specific settings and requirements

4. Workflow Execution
   - Step-by-step execution flow
   - Trigger conditions and events
   - Data processing at each step
   - Expected outputs and results

5. Integration Guide
   - How to integrate with external services
   - API documentation for each integration point
   - Data format requirements
   - Authentication and security considerations

6. Troubleshooting
   - Common issues specific to this workflow
   - Component-specific error handling
   - Debugging steps for each node type
   - Recovery procedures

Make the documentation highly specific to this workflow's components and their interactions. Include actual configuration examples and code snippets where relevant. Focus on the unique aspects of this workflow and how its components work together.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw new Error('Failed to generate documentation');
  }
} 
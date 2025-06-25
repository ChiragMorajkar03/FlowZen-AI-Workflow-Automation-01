
interface AppResponse {
  answer: string;
  followUpQuestions?: string[];
}

/**
 * Provides application-specific responses based on predefined knowledge
 * @param query The user's query
 * @returns An application-specific response if available, or null
 */
export function getApplicationSpecificResponse(query: string): AppResponse | null {
  // Convert query to lowercase for case-insensitive matching
  const normalizedQuery = query.toLowerCase();
  
  // Application knowledge base
  const knowledgeBase: Record<string, AppResponse> = {
    // General app information
    "what is fuzzie": {
      answer: "Fuzzie is an automation platform that helps you connect and automate workflows between different services like Discord, Notion, Slack, GitHub, and email. It allows you to build custom automations without coding or use AI to generate workflows from natural language prompts. It also supports team collaboration for shared workflows.",
      followUpQuestions: [
        "How do I create a workflow?",
        "What integrations are available?",
        "How does team collaboration work?",
        "Is there a free plan?"
      ]
    },
    
    "how does fuzzie work": {
      answer: "Fuzzie works by connecting different services through a visual workflow builder. You create nodes for each service, configure triggers and actions, and connect them with edges to define the flow of data and operations.",
      followUpQuestions: [
        "What is a node in Fuzzie?",
        "How do I connect services?"
      ]
    },
    
    // Team collaboration information
    "how does team collaboration work": {
      answer: "Team collaboration in Fuzzie allows you to share workflows with your team members. You can create team workflows, control visibility settings (private, team, or public), and collaborate on automation projects. Team owners and admins can manage permissions, while members can use and edit shared workflows based on their access level.",
      followUpQuestions: [
        "How do I share a workflow with my team?",
        "How do I change workflow visibility?",
        "Can I see who made changes to a workflow?"
      ]
    },
    
    "how do i share a workflow with my team": {
      answer: "To share a workflow with your team: 1) Open the workflow in the editor, 2) Look for the Team Collaboration Panel at the top of the sidebar, 3) Click 'Share with Team', 4) Select a team from the dropdown, 5) Choose visibility settings, and 6) Click 'Share Workflow'. Team members will then be able to access the workflow based on their permissions.",
      followUpQuestions: [
        "How do I change workflow visibility?",
        "What are the different visibility options?"
      ]
    },
    
    "what are the different visibility options": {
      answer: "Fuzzie offers three visibility options for workflows: 1) Private - only you can see and edit the workflow, 2) Team - all team members can see and edit the workflow based on their permissions, 3) Public - anyone with the link can view the workflow, but only team members can edit it.",
      followUpQuestions: [
        "How do I change workflow visibility?",
        "How do I manage team permissions?"
      ]
    },
    
    // AI workflow builder information
    "what is the ai workflow builder": {
      answer: "The AI Workflow Builder is a feature that allows you to create workflows using natural language prompts. Simply describe the automation you want to build, and the AI will generate a workflow with the appropriate triggers, actions, and connections. You can then customize the generated workflow as needed.",
      followUpQuestions: [
        "How do I use the AI workflow builder?",
        "What kind of prompts work best?",
        "Can I edit AI-generated workflows?"
      ]
    },
    
    "how do i use the ai workflow builder": {
      answer: "To use the AI Workflow Builder: 1) Click the '+' button to create a new workflow, 2) Select the 'AI Builder' tab, 3) Enter a description of the workflow you want to create (e.g., 'Create a workflow that posts new GitHub issues to a Slack channel'), 4) Click 'Generate Workflow'. The AI will create a workflow based on your description, which you can then customize in the editor.",
      followUpQuestions: [
        "What kind of prompts work best?",
        "Can I edit AI-generated workflows?"
      ]
    },
    
    "what kind of prompts work best": {
      answer: "The best prompts for the AI Workflow Builder are specific and include details about the services you want to connect and the actions you want to perform. For example, instead of saying 'Create a GitHub workflow', say 'Create a workflow that sends a Slack message whenever a new pull request is opened in my GitHub repository'. Including triggers, conditions, and desired outcomes helps the AI generate more accurate workflows.",
      followUpQuestions: [
        "Can I edit AI-generated workflows?",
        "Are there example prompts I can use?"
      ]
    },
    
    "can i edit ai-generated workflows": {
      answer: "Yes, you can edit AI-generated workflows just like any other workflow. After the AI creates the initial workflow, you'll be taken to the workflow editor where you can add, remove, or modify nodes, change connections, adjust settings, and customize the workflow to meet your specific needs.",
      followUpQuestions: [
        "How do I create a workflow?",
        "What integrations are available?"
      ]
    }
  };
  
  // Check if the query matches any key in the knowledge base
  for (const key in knowledgeBase) {
    if (normalizedQuery.includes(key)) {
      return knowledgeBase[key];
    }
  }
  
  // No match found
  return null;
}

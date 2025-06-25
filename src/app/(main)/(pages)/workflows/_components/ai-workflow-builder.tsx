'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, InfoIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createAiWorkflow } from '../_actions/ai-workflow-actions'

interface AiWorkflowBuilderProps {
  onClose?: () => void
}

const AiWorkflowBuilder = ({ onClose }: AiWorkflowBuilderProps) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
  }

  const handleGenerateWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to generate a workflow')
      return
    }

    setIsGenerating(true)
    try {
      const result = await createAiWorkflow(prompt)
      
      if (result.success && result.workflowId) {
        toast.success('Workflow created successfully!')
        router.push(`/workflows/editor/${result.workflowId}`)
        if (onClose) onClose()
      } else {
        toast.error(result.message || 'Failed to generate workflow')
      }
    } catch (error) {
      console.error('Error generating workflow:', error)
      toast.error('An error occurred while generating the workflow')
    } finally {
      setIsGenerating(false)
    }
  }

  const examplePrompts = [
    "Create a workflow that posts new GitHub issues to a Slack channel",
    "Build a workflow to send an email summary of my Google Calendar events each morning",
    "Create an automation that saves email attachments to Google Drive",
    "Make a workflow that notifies me on Discord when a GitHub PR is ready for review"
  ]

  const handleUseExample = (example: string) => {
    setPrompt(example)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Workflow Builder
        </CardTitle>
        <CardDescription>
          Describe the workflow you want to create in natural language, and our AI will build it for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="E.g., Create a workflow that posts new GitHub issues to a Slack channel"
          className="min-h-[120px] resize-none"
          value={prompt}
          onChange={handlePromptChange}
          disabled={isGenerating}
        />
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Example prompts:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                onClick={() => handleUseExample(example)}
                disabled={isGenerating}
              >
                {example.length > 30 ? example.substring(0, 30) + '...' : example}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 mb-4">
          <InfoIcon className="h-4 w-4 inline-block mr-2" />
          <h5 className="font-medium inline-block">Tips for better results</h5>
          <p className="mt-1 text-sm">
            Be specific about which services to connect and what actions to perform. Include details like triggers, conditions, and desired outcomes.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleGenerateWorkflow} 
          disabled={!prompt.trim() || isGenerating}
          className="ml-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Workflow
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AiWorkflowBuilder

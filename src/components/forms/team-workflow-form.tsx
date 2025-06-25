'use client'

import { WorkflowFormSchema } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { onCreateWorkflow } from '@/app/(main)/(pages)/workflows/_actions/workflow-connections'
import { createTeamWorkflow } from '@/app/(main)/(pages)/workflows/_actions/team-workflow-actions'
import { useModal } from '@/providers/modal-provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { getUserTeams } from '@/app/(main)/(pages)/teams/_actions/team-actions-fix'

type Props = {
  title?: string
  subTitle?: string
}

interface Team {
  id: string
  name: string
  role: string
}

const TeamWorkflowForm = ({ subTitle, title }: Props) => {
  const { setClose } = useModal()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const initialTeamId = searchParams.get('teamId')

  // Initialize form outside of render to prevent state updates during rendering
  const form = useForm<z.infer<typeof WorkflowFormSchema> & { teamId: string; visibility: string }>({
    mode: 'onChange',
    resolver: zodResolver(
      WorkflowFormSchema.extend({
        teamId: z.string().optional(),
        visibility: z.string().default('team')
      })
    ),
    defaultValues: {
      name: '',
      description: '',
      teamId: initialTeamId || '',
      visibility: 'team'
    },
  })

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true)
      try {
        const userTeams = await getUserTeams()
        // Filter teams where user can create workflows
        const filteredTeams = userTeams.filter(team => 
          team.role === 'owner' || team.role === 'admin' || 
          // Add logic to check if member has canCreateWorkflows permission
          team.role === 'member' // This would need additional data from the API
        )
        setTeams(filteredTeams)
      } catch (error) {
        console.error('Error fetching teams:', error)
        toast.error('Failed to load teams')
      } finally {
        setIsLoadingTeams(false)
      }
    }

    fetchTeams()
  }, [])

  const isLoading = form.formState.isSubmitting

  const handleSubmit = async (values: z.infer<typeof WorkflowFormSchema> & { teamId: string; visibility: string }) => {
    try {
      if (values.teamId) {
        // Create team workflow
        const result = await createTeamWorkflow(values.teamId, {
          name: values.name,
          description: values.description
        }, values.visibility)
        
        toast.success(result.message)
        
        if (result.workflow?.id) {
          router.push(`/workflows/editor/${result.workflow.id}`)
        } else {
          router.refresh()
        }
      } else {
        // Create personal workflow
        const workflow = await onCreateWorkflow({
          name: values.name,
          description: values.description
        })
        
        if (workflow) {
          toast.success(workflow.message)
          router.refresh()
        }
      }
      
      setClose()
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error('Failed to create workflow')
    }
  }

  return (
    <Card className="w-full max-w-[650px] border-none">
      {title && subTitle && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subTitle}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4 text-left"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Workflow name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Workflow description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading || isLoadingTeams}
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team (Optional)</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={isLoading || isLoadingTeams}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team or leave empty for personal workflow" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Personal Workflow</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} ({team.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('teamId') && (
              <FormField
                disabled={isLoading}
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="team">Team Only</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private (Only You)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button
              className="mt-4"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Workflow
                </>
              ) : (
                'Create Workflow'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default TeamWorkflowForm

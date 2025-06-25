'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Users, Share2, Lock, Globe, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/components/ui/use-toast'
import { getUserTeams } from '@/app/(main)/(pages)/teams/_actions/team-actions-fix'
import { shareWorkflowWithTeam, updateTeamWorkflow } from '@/app/(main)/(pages)/workflows/_actions/team-workflow-actions'

interface TeamCollaborationPanelProps {
  workflowId: string
  teamId?: string
  visibility?: string
  isOwner: boolean
  onUpdate: () => void
}

interface Team {
  id: string
  name: string
  role: string
  memberCount: number
}

const TeamCollaborationPanel = ({ 
  workflowId, 
  teamId, 
  visibility = 'private',
  isOwner,
  onUpdate
}: TeamCollaborationPanelProps) => {
  const { user } = useUser()
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string>(teamId || '')
  const [selectedVisibility, setSelectedVisibility] = useState<string>(visibility)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return
      
      setIsLoadingTeams(true)
      try {
        const userTeams = await getUserTeams()
        setTeams(userTeams)
        
        if (teamId) {
          const team = userTeams.find(t => t.id === teamId)
          if (team) {
            setCurrentTeam(team)
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
        toast({
          title: 'Error',
          description: 'Failed to load teams',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingTeams(false)
      }
    }

    fetchTeams()
  }, [user, teamId, toast])

  const handleShareWithTeam = async () => {
    if (!selectedTeam) {
      toast({
        title: 'Error',
        description: 'Please select a team',
        variant: 'destructive'
      })
      return
    }

    setIsUpdating(true)
    try {
      await shareWorkflowWithTeam(workflowId, selectedTeam, selectedVisibility)
      
      toast({
        title: 'Success',
        description: 'Workflow shared with team successfully'
      })
      
      setIsShareDialogOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error sharing workflow with team:', error)
      toast({
        title: 'Error',
        description: 'Failed to share workflow with team',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateVisibility = async () => {
    setIsUpdating(true)
    try {
      await updateTeamWorkflow(workflowId, { visibility: selectedVisibility })
      
      toast({
        title: 'Success',
        description: 'Workflow visibility updated successfully'
      })
      
      setIsVisibilityDialogOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating workflow visibility:', error)
      toast({
        title: 'Error',
        description: 'Failed to update workflow visibility',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case 'private':
        return <Lock className="h-4 w-4" />
      case 'team':
        return <Users className="h-4 w-4" />
      case 'public':
        return <Globe className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const getVisibilityLabel = (vis: string) => {
    switch (vis) {
      case 'private':
        return 'Private (Only You)'
      case 'team':
        return 'Team Only'
      case 'public':
        return 'Public (All Team Members)'
      default:
        return 'Private'
    }
  }

  if (!teamId && !isOwner) {
    return null
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {teamId ? 'Team Collaboration' : 'Share with Team'}
        </CardTitle>
        {teamId && (
          <CardDescription>
            This workflow is shared with a team
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        {teamId && currentTeam ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {currentTeam.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentTeam.name}</p>
                  <p className="text-xs text-muted-foreground">{currentTeam.memberCount} members</p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getVisibilityIcon(visibility)}
                      <span>{getVisibilityLabel(visibility)}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current visibility setting</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            This workflow is not shared with any team. Share it to collaborate with team members.
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        {teamId ? (
          <div className="flex gap-2 w-full">
            <Dialog open={isVisibilityDialogOpen} onOpenChange={setIsVisibilityDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  {visibility === 'private' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  Change Visibility
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Workflow Visibility</DialogTitle>
                  <DialogDescription>
                    Choose who can see and access this workflow
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select
                    value={selectedVisibility}
                    onValueChange={setSelectedVisibility}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Private (Only You)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="team">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Team Only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Public (All Team Members)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsVisibilityDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateVisibility} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Visibility'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  Invite Members
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Members</DialogTitle>
                  <DialogDescription>
                    To invite members, go to the team page
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    You can invite new members to collaborate on this workflow by visiting the team page and adding them to the team.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/teams/${teamId}`, '_blank')}
                  >
                    Go to Team Page
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 w-full">
                <Share2 className="h-4 w-4" />
                Share with Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share with Team</DialogTitle>
                <DialogDescription>
                  Share this workflow with a team to collaborate with other members
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Team</label>
                  <Select
                    value={selectedTeam}
                    onValueChange={setSelectedTeam}
                    disabled={isLoadingTeams || isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} ({team.memberCount} members)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <Select
                    value={selectedVisibility}
                    onValueChange={setSelectedVisibility}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Private (Only You)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="team">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Team Only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Public (All Team Members)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleShareWithTeam} disabled={isUpdating || !selectedTeam}>
                  {isUpdating ? 'Sharing...' : 'Share Workflow'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  )
}

export default TeamCollaborationPanel

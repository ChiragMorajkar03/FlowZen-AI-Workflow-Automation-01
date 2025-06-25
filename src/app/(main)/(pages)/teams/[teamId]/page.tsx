'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { getTeamDetails, inviteToTeam, removeFromTeam, updateTeam } from '../_actions/team-actions'
import { Users, Settings, Workflow, FolderKanban, Plus, Mail, UserPlus, Trash2, Edit, Share2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface TeamMember {
  id: string
  role: string
  joinedAt: string
  user: {
    clerkId: string
    name: string | null
    email: string
    profileImage: string | null
  }
  canCreateWorkflows: boolean
  canEditWorkflows: boolean
  canDeleteWorkflows: boolean
  canInviteMembers: boolean
  canManageRoles: boolean
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  updatedAt: string
}

interface Workflow {
  id: string
  name: string
  description: string
  visibility: string
  lastModified: string
}

interface TeamDetails {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
  createdAt: string
  members: TeamMember[]
  projects: Project[]
  workflows: Workflow[]
}

const TeamPage = () => {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const teamId = params.teamId as string
  
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [editTeamData, setEditTeamData] = useState({
    name: '',
    description: ''
  })
  
  const userRole = team?.members.find(member => member.user.clerkId === user?.id)?.role || 'member'
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'
  
  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!teamId) return
      
      setIsLoading(true)
      try {
        const teamDetails = await getTeamDetails(teamId)
        setTeam(teamDetails)
        setEditTeamData({
          name: teamDetails.name,
          description: teamDetails.description || ''
        })
      } catch (error) {
        console.error('Error fetching team details:', error)
        toast({
          title: 'Error',
          description: 'Failed to load team details. Please try again.',
          variant: 'destructive'
        })
        router.push('/teams')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTeamDetails()
  }, [teamId, router, toast, user?.id])
  
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive'
      })
      return
    }
    
    try {
      await inviteToTeam(teamId, inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteDialogOpen(false)
      toast({
        title: 'Success',
        description: 'Invitation sent successfully'
      })
      
      // Refresh team details
      const teamDetails = await getTeamDetails(teamId)
      setTeam(teamDetails)
    } catch (error) {
      console.error('Error inviting member:', error)
      toast({
        title: 'Error',
        description: 'Failed to invite member. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return
    }
    
    try {
      await removeFromTeam(teamId, memberId)
      toast({
        title: 'Success',
        description: 'Member removed successfully'
      })
      
      // Refresh team details
      const teamDetails = await getTeamDetails(teamId)
      setTeam(teamDetails)
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove member. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editTeamData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive'
      })
      return
    }
    
    try {
      await updateTeam(teamId, {
        name: editTeamData.name,
        description: editTeamData.description || null
      })
      setIsEditTeamDialogOpen(false)
      toast({
        title: 'Success',
        description: 'Team updated successfully'
      })
      
      // Refresh team details
      const teamDetails = await getTeamDetails(teamId)
      setTeam(teamDetails)
    } catch (error) {
      console.error('Error updating team:', error)
      toast({
        title: 'Error',
        description: 'Failed to update team. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!team) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Team not found</h2>
          <p className="text-muted-foreground mb-4">The team you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/teams')}>Back to Teams</Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-4 relative">
      <div className="sticky top-0 z-[10] p-6 bg-background/50 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {team.avatarUrl ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={team.avatarUrl} alt={team.name} />
                <AvatarFallback>
                  <Users className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-muted-foreground">{team.members.length} members</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isOwnerOrAdmin && (
              <>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleInviteMember}>
                      <DialogHeader>
                        <DialogTitle>Invite to team</DialogTitle>
                        <DialogDescription>
                          Invite a new member to join your team.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              {userRole === 'owner' && (
                                <SelectItem value="admin">Admin</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Send Invitation
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleUpdateTeam}>
                      <DialogHeader>
                        <DialogTitle>Team Settings</DialogTitle>
                        <DialogDescription>
                          Update your team information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="team-name">Team Name</Label>
                          <Input
                            id="team-name"
                            placeholder="Enter team name"
                            value={editTeamData.name}
                            onChange={(e) => setEditTeamData({ ...editTeamData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="team-description">Description</Label>
                          <Input
                            id="team-description"
                            placeholder="Enter team description"
                            value={editTeamData.description}
                            onChange={(e) => setEditTeamData({ ...editTeamData, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditTeamDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="p-6">
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p>{team.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p>{new Date(team.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Your Role</h3>
                    <p className="capitalize">{userRole}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Members</h3>
                    </div>
                    <p className="text-2xl font-bold">{team.members.length}</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FolderKanban className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Projects</h3>
                    </div>
                    <p className="text-2xl font-bold">{team.projects.length}</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Workflow className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Workflows</h3>
                    </div>
                    <p className="text-2xl font-bold">{team.workflows.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity - This would be implemented with a real activity feed */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activity to display.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Team Members</h2>
            {isOwnerOrAdmin && (
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
          
          <div className="grid gap-4">
            {team.members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.profileImage || undefined} alt={member.user.name || ''} />
                      <AvatarFallback>
                        {member.user.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{member.user.name || member.user.email}</h3>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                          {member.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isOwnerOrAdmin && member.user.clerkId !== user?.id && (
                    <div className="flex gap-2">
                      {userRole === 'owner' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Projects</h2>
            <Button variant="outline" onClick={() => router.push('/projects/new?teamId=' + teamId)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
          
          {team.projects.length === 0 ? (
            <div className="text-center p-10 border rounded-lg bg-muted/10">
              <FolderKanban className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a project to organize your team's work and track progress.
              </p>
              <Button onClick={() => router.push('/projects/new?teamId=' + teamId)}>
                <Plus className="h-4 w-4 mr-2" />
                Create a Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.projects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                      <FolderKanban className="h-5 w-5" />
                      {project.name}
                    </CardTitle>
                    <CardDescription>
                      {project.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                        {project.status}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${project.id}`)}>
                      View Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="workflows" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Team Workflows</h2>
            <Button variant="outline" onClick={() => router.push('/workflows/editor?teamId=' + teamId)}>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>
          
          {team.workflows.length === 0 ? (
            <div className="text-center p-10 border rounded-lg bg-muted/10">
              <Workflow className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
              <p className="text-muted-foreground mb-4">
                Create workflows to automate your team's processes.
              </p>
              <Button onClick={() => router.push('/workflows/editor?teamId=' + teamId)}>
                <Plus className="h-4 w-4 mr-2" />
                Create a Workflow
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.workflows.map((workflow) => (
                <Card key={workflow.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/workflows/editor/${workflow.id}`)}>
                      <Workflow className="h-5 w-5" />
                      {workflow.name}
                    </CardTitle>
                    <CardDescription>
                      {workflow.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                        {workflow.visibility}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        Updated {new Date(workflow.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/workflows/editor/${workflow.id}`)}>
                      Edit Workflow
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </div>
    </div>
  )
}

export default TeamPage

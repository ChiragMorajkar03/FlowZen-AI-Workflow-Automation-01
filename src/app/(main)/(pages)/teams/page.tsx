'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Settings, Share2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createTeam, getUserTeams } from './_actions/team-actions-fix'
import { useUser } from '@clerk/nextjs'

interface Team {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
  memberCount: number
  role: string
}

const TeamsPage = () => {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useUser()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: ''
  })

  // Fetch user's teams
  React.useEffect(() => {
    const fetchTeams = async () => {
      if (user?.id) {
        setIsLoading(true)
        try {
          const userTeams = await getUserTeams()
          setTeams(userTeams)
        } catch (error) {
          console.error('Error fetching teams:', error)
          toast({
            title: 'Error',
            description: 'Failed to load teams. Please try again.',
            variant: 'destructive'
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchTeams()
  }, [user?.id, toast])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTeam.name.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const createdTeam = await createTeam(newTeam.name, newTeam.description)
      setTeams([...teams, {
        ...createdTeam,
        memberCount: 1,
        role: 'owner'
      }])
      setNewTeam({ name: '', description: '' })
      setIsCreateDialogOpen(false)
      toast({
        title: 'Success',
        description: 'Team created successfully'
      })
    } catch (error) {
      console.error('Error creating team:', error)
      toast({
        title: 'Error',
        description: 'Failed to create team. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToTeam = (teamId: string) => {
    router.push(`/teams/${teamId}`)
  }

  return (
    <div className="flex flex-col gap-4 relative">
      <h1 className="text-4xl sticky top-0 z-[10] p-6 bg-background/50 backdrop-blur-lg flex items-center justify-between border-b">
        Teams
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateTeam}>
              <DialogHeader>
                <DialogTitle>Create a new team</DialogTitle>
                <DialogDescription>
                  Create a team to collaborate on workflows and projects with your colleagues.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter team name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your team's purpose"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </h1>

      <div className="p-6">
        {isLoading && teams.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center p-10 border rounded-lg bg-muted/10">
            <Users className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a team to collaborate on workflows and projects with your colleagues.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create a Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToTeam(team.id)}>
                      {team.avatarUrl ? (
                        <img src={team.avatarUrl} alt={team.name} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {team.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      {team.role === 'owner' || team.role === 'admin' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <CardDescription>
                    {team.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                  </div>
                  <div className="mt-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary inline-block">
                    {team.role}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => navigateToTeam(team.id)}>
                    View Team
                  </Button>
                  {team.role === 'owner' || team.role === 'admin' ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        Invite
                      </Button>
                      {team.role === 'owner' && (
                        <Button variant="outline" size="sm" className="flex items-center gap-1 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ) : null}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamsPage

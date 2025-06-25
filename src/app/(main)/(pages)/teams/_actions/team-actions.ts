'use server'

import { db } from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function createTeam(name: string, description?: string) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      throw new Error('Unauthorized')
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

    console.log('Creating team with owner:', userId)
    
    // Use Prisma's executeRaw to directly execute SQL
    // Generate a UUID for the team
    const teamId = await db.$queryRaw<{id: string}[]>`SELECT gen_random_uuid() as id`;
    const uuid = teamId[0].id;
    
    // Insert the team record
    await db.$executeRaw`
      INSERT INTO "Team" ("id", "name", "description", "ownerId", "createdAt", "updatedAt")
      VALUES (${uuid}, ${name}, ${description || null}, ${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    console.log('Team created:', uuid);
    
    // Generate a UUID for the team member
    const memberId = await db.$queryRaw<{id: string}[]>`SELECT gen_random_uuid() as id`;
    const memberUuid = memberId[0].id;
    
    // Insert the team membership record
    await db.$executeRaw`
      INSERT INTO "TeamMember" (
        "id", "teamId", "userId", "role", "joinedAt", 
        "canCreateWorkflows", "canEditWorkflows", "canDeleteWorkflows", 
        "canInviteMembers", "canManageRoles"
      )
      VALUES (
        ${memberUuid}, ${uuid}, ${userId}, 'owner', CURRENT_TIMESTAMP,
        true, true, true, true, true
      )
    `;
    
    console.log('Team membership created:', memberUuid);
    
    revalidatePath('/teams');
    
    // Return the team data
    return {
      id: uuid,
      name: name,
      description: description || null,
      members: [{
        id: memberUuid,
        role: 'owner',
        userId: userId
      }]
    };
  } catch (error) {
    console.error('Error creating team:', error);
    throw new Error('Failed to create team');
  }
}

export async function getUserTeams() {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      throw new Error('Unauthorized')
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
      
      // If this is a new user, they won't have any teams yet
      return []
    }

    // Get teams where user is a member using a direct SQL query
    type TeamResult = {
      id: string;
      name: string;
      description: string | null;
      avatarUrl: string | null;
      role: string;
      memberCount: string;
    };

    const teamData = await db.$queryRaw<TeamResult[]>`
      SELECT 
        t."id", 
        t."name", 
        t."description", 
        t."avatarUrl",
        tm."role",
        COUNT(tm2."id")::text as "memberCount"
      FROM "Team" t
      JOIN "TeamMember" tm ON t."id" = tm."teamId"
      LEFT JOIN "TeamMember" tm2 ON t."id" = tm2."teamId"
      WHERE tm."userId" = ${userId}
      GROUP BY t."id", t."name", t."description", t."avatarUrl", tm."role"
    `;

    // Format teams for the UI
    return teamData.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      avatarUrl: team.avatarUrl,
      memberCount: parseInt(team.memberCount),
      role: team.role
    }))
  } catch (error) {
    console.error('Error fetching user teams:', error)
    throw new Error('Failed to fetch teams')
  }
}

export async function getTeamDetails(teamId: string) {
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

    // Get team details with members
    const team = await db.team.findUnique({
      where: {
        id: teamId
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                clerkId: true,
                name: true,
                email: true,
                profileImage: true
              }
            }
          }
        },
        projects: {
          orderBy: {
            updatedAt: 'desc'
          },
          take: 5
        },
        workflows: {
          where: {
            visibility: {
              in: ['team', 'public']
            }
          },
          orderBy: {
            lastModified: 'desc'
          },
          take: 5
        }
      }
    })

    if (!team) {
      throw new Error('Team not found')
    }

    return team
  } catch (error) {
    console.error('Error fetching team details:', error)
    throw new Error('Failed to fetch team details')
  }
}

export async function inviteToTeam(teamId: string, email: string, role: string = 'member') {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Check if user has permission to invite
    const teamMember = await db.teamMember.findFirst({
      where: {
        teamId,
        userId,
        canInviteMembers: true
      }
    })

    if (!teamMember) {
      throw new Error('You do not have permission to invite members')
    }

    // Find the user by email
    const invitedUser = await db.user.findUnique({
      where: {
        email
      }
    })

    if (!invitedUser) {
      // In a real app, you might send an email invitation here
      throw new Error('User not found')
    }

    // Check if user is already a member
    const existingMember = await db.teamMember.findFirst({
      where: {
        teamId,
        userId: invitedUser.clerkId
      }
    })

    if (existingMember) {
      throw new Error('User is already a member of this team')
    }

    // Add user to team
    await db.teamMember.create({
      data: {
        team: {
          connect: {
            id: teamId
          }
        },
        user: {
          connect: {
            clerkId: invitedUser.clerkId
          }
        },
        role,
        // Set permissions based on role
        canCreateWorkflows: role === 'admin',
        canEditWorkflows: role === 'admin',
        canDeleteWorkflows: role === 'admin',
        canInviteMembers: role === 'admin',
        canManageRoles: role === 'admin'
      }
    })

    // Create notification for the invited user
    await db.notification.create({
      data: {
        type: 'team-invite',
        content: `You have been added to a team`,
        user: {
          connect: {
            clerkId: invitedUser.clerkId
          }
        }
      }
    })

    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch (error) {
    console.error('Error inviting to team:', error)
    throw new Error('Failed to invite user to team')
  }
}

export async function removeFromTeam(teamId: string, memberId: string) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Check if user has permission to remove members
    const teamMember = await db.teamMember.findFirst({
      where: {
        teamId,
        userId,
        OR: [
          { role: 'owner' },
          { canManageRoles: true }
        ]
      }
    })

    if (!teamMember) {
      throw new Error('You do not have permission to remove members')
    }

    // Get the member to remove
    const memberToRemove = await db.teamMember.findUnique({
      where: {
        id: memberId
      }
    })

    if (!memberToRemove) {
      throw new Error('Member not found')
    }

    // Cannot remove the owner
    if (memberToRemove.role === 'owner') {
      throw new Error('Cannot remove the team owner')
    }

    // Remove the member
    await db.teamMember.delete({
      where: {
        id: memberId
      }
    })

    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch (error) {
    console.error('Error removing team member:', error)
    throw new Error('Failed to remove team member')
  }
}

export async function updateTeam(teamId: string, data: { name?: string; description?: string; avatarUrl?: string }) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Check if user has permission to update team
    const teamMember = await db.teamMember.findFirst({
      where: {
        teamId,
        userId,
        OR: [
          { role: 'owner' },
          { role: 'admin' }
        ]
      }
    })

    if (!teamMember) {
      throw new Error('You do not have permission to update this team')
    }

    // Update team
    const updatedTeam = await db.team.update({
      where: {
        id: teamId
      },
      data
    })

    revalidatePath(`/teams/${teamId}`)
    return updatedTeam
  } catch (error) {
    console.error('Error updating team:', error)
    throw new Error('Failed to update team')
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Check if user is the team owner
    const teamMember = await db.teamMember.findFirst({
      where: {
        teamId,
        userId,
        role: 'owner'
      }
    })

    if (!teamMember) {
      throw new Error('Only the team owner can delete the team')
    }

    // Delete team
    await db.team.delete({
      where: {
        id: teamId
      }
    })

    revalidatePath('/teams')
    return { success: true }
  } catch (error) {
    console.error('Error deleting team:', error)
    throw new Error('Failed to delete team')
  }
}

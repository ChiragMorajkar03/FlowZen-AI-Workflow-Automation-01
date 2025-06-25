'use server'

import { db } from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

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
    
    // Generate UUIDs
    const teamUuid = uuidv4();
    const memberUuid = uuidv4();
    
    // Use direct database queries
    await db.$executeRaw`
      INSERT INTO "Team" ("id", "name", "description", "ownerId", "createdAt", "updatedAt")
      VALUES (${teamUuid}, ${name}, ${description || null}, ${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    console.log('Team created:', teamUuid);
    
    await db.$executeRaw`
      INSERT INTO "TeamMember" (
        "id", "teamId", "userId", "role", "joinedAt", 
        "canCreateWorkflows", "canEditWorkflows", "canDeleteWorkflows", 
        "canInviteMembers", "canManageRoles"
      )
      VALUES (
        ${memberUuid}, ${teamUuid}, ${userId}, 'owner', CURRENT_TIMESTAMP,
        true, true, true, true, true
      )
    `;
    
    console.log('Team membership created:', memberUuid);
    
    revalidatePath('/teams');
    
    return {
      id: teamUuid,
      name: name,
      description: description || null,
      avatarUrl: null,
      memberCount: 1,
      role: 'owner',
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

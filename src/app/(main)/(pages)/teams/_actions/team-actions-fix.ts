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
    
    // Create the team and team membership using Prisma directly
    // Create with Prisma models instead of SQL
    const team = await db.$transaction(async (tx) => {
      // Check if 'team' model exists
      try {
        const teamObj = await tx.team.create({
          data: {
            name,
            description: description || null,
            ownerId: userId,
          }
        });
        
        console.log('Team created:', teamObj.id);
        
        // Create team membership
        const teamMember = await tx.teamMember.create({
          data: {
            teamId: teamObj.id,
            userId,
            role: 'owner',
            canCreateWorkflows: true,
            canEditWorkflows: true,
            canDeleteWorkflows: true,
            canInviteMembers: true,
            canManageRoles: true
          }
        });
        
        console.log('Team membership created:', teamMember.id);
        
        return { teamObj, teamMember };
      } catch (error) {
        console.error('Error in transaction, trying alternate approach:', error);
        // If the first approach fails, try with a direct query
        throw error;
      }
    }).catch(async (error) => {
      // Fallback to direct database queries if there's an issue with Prisma models
      console.log('Trying to create team with direct queries');
      
      // Try creating using SQL directly but with the correct table names
      // First, find out the actual table name by using a query to list tables
      try {
        const tables = await db.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
        console.log('Available tables:', tables);
        
        // Use what we discovered to create records
        const teamUuid = uuidv4();
        const memberUuid = uuidv4();
        
        // Check if tables include 'team' or 'Team'
        const teamTableName = Array.isArray(tables) && tables.some((t: any) => t.tablename === 'team') 
          ? 'team' : 'Team';
        
        const teamMemberTableName = Array.isArray(tables) && tables.some((t: any) => t.tablename === 'teammember') 
          ? 'teammember' : 'TeamMember';
        
        // Create team and member
        await db.$executeRaw`
          INSERT INTO "${teamTableName}" ("id", "name", "description", "ownerId", "createdAt", "updatedAt")
          VALUES (${teamUuid}, ${name}, ${description || null}, ${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        await db.$executeRaw`
          INSERT INTO "${teamMemberTableName}" (
            "id", "teamId", "userId", "role", "joinedAt", 
            "canCreateWorkflows", "canEditWorkflows", "canDeleteWorkflows", 
            "canInviteMembers", "canManageRoles"
          )
          VALUES (
            ${memberUuid}, ${teamUuid}, ${userId}, 'owner', CURRENT_TIMESTAMP,
            true, true, true, true, true
          )
        `;
        
        return {
          teamObj: {
            id: teamUuid,
            name,
            description: description || null,
          },
          teamMember: {
            id: memberUuid,
            role: 'owner',
            userId,
          }
        };
      } catch (innerError) {
        console.error('Fallback attempt also failed:', innerError);
        throw innerError;
      }
    });
    
    revalidatePath('/teams');
    
    return {
      id: team.teamObj.id,
      name: team.teamObj.name,
      description: team.teamObj.description,
      avatarUrl: null,
      memberCount: 1,
      role: 'owner',
      members: [{
        id: team.teamMember.id,
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

    try {
      // First try the standard Prisma approach
      const teamMembers = await db.teamMember.findMany({
        where: {
          userId
        },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      });

      // Format teams for the UI
      return teamMembers.map(member => ({
        id: member.team.id,
        name: member.team.name,
        description: member.team.description,
        avatarUrl: member.team.avatarUrl,
        memberCount: member.team.members.length,
        role: member.role
      }));
    } catch (error) {
      console.error('Error fetching teams with Prisma, trying direct query:', error);
      
      // Fallback to direct query
      try {
        // Get all available tables
        const tables = await db.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
        console.log('Available tables:', tables);
        
        // Check if tables include 'team' or 'Team'
        const teamTableName = Array.isArray(tables) && tables.some((t: any) => t.tablename === 'team') 
          ? 'team' : 'Team';
        
        const teamMemberTableName = Array.isArray(tables) && tables.some((t: any) => t.tablename === 'teammember') 
          ? 'teammember' : 'TeamMember';
        
        // Use a direct query with the correct table names
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
          FROM "${teamTableName}" t
          JOIN "${teamMemberTableName}" tm ON t."id" = tm."teamId"
          LEFT JOIN "${teamMemberTableName}" tm2 ON t."id" = tm2."teamId"
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
        }));
      } catch (innerError) {
        console.error('Fallback attempt also failed:', innerError);
        return [];
      }
    }
  } catch (error) {
    console.error('Error fetching user teams:', error)
    throw new Error('Failed to fetch teams')
  }
}

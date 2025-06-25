import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs'

export const getDashboardData = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    // Get active workflows count
    const activeWorkflows = await db.workflows.count({
      where: {
        userId: user.id,
        publish: true
      }
    })

    // Get recent workflows
    const recentWorkflows = await db.workflows.findMany({
      where: {
        userId: user.id
      },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        publish: true
      }
    })

    // Get system status (check connections)
    const connections = await db.connections.findMany({
      where: {
        userId: user.id
      }
    })

    const systemStatus = connections.length > 0 ? 'All Systems Operational' : 'Setup Required'

    return {
      activeWorkflows,
      recentWorkflows,
      systemStatus
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }
} 
'use server'

import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { Octokit } from '@octokit/rest'

export const onGitHubConnect = async (access_token: string, id: string) => {
  console.log('🔄 Attempting GitHub connection for user:', id)

  // ✅ Check for required fields
  if (!access_token) {
    console.error('❌ Missing access token!')
    return { error: 'Access token is required' }
  }

  if (!id) {
    console.error('❌ User ID is missing!')
    return { error: 'User ID is required' }
  }

  // ✅ Get GitHub username using access token
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  if (!response.ok) {
    console.error('❌ Failed to fetch GitHub user info!')
    return { error: 'Failed to fetch GitHub user info' }
  }

  const data = await response.json()
  const username = data.login

  // ✅ Check if GitHub is already connected
  const githubConnection = await db.gitHub.findFirst({
    where: { accessToken: access_token },
    include: { connections: true },
  })

  if (!githubConnection) {
    console.log('⏳ Creating new GitHub connection...')
    try {
      await db.gitHub.create({
        data: {
          userId: id,
          accessToken: access_token,
          username: username,
          connections: {
            create: { userId: id, type: 'GitHub' },
          },
        },
      })
      return { success: true }
    } catch (error) {
      console.error('🚨 Error creating GitHub connection:', error)
      return { error: 'Failed to create GitHub connection' }
    }
  } else {
    console.log('⚠️ GitHub connection already exists!')
    return { message: 'GitHub is already connected' }
  }
}

/** ✅ Fetch GitHub Connection */
export async function getGitHubConnection() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Unauthorized')
    }

    const githubConnection = await db.gitHub.findFirst({
      where: {
        userId: user.id,
      },
    })

    if (!githubConnection) {
      throw new Error('No GitHub connection found')
    }

    return githubConnection
  } catch (error) {
    console.error('Error getting GitHub connection:', error)
    throw error
  }
}

export async function getGitHubRepositories() {
  try {
    const githubConnection = await getGitHubConnection()
    const octokit = new Octokit({
      auth: githubConnection.accessToken,
    })

    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    })

    // Return the full repository objects
    return repos
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    throw error
  }
}

export async function createGitHubIssue(
  repoName: string,
  title: string,
  body: string
) {
  try {
    const githubConnection = await getGitHubConnection()
    const octokit = new Octokit({
      auth: githubConnection.accessToken,
    })

    const [owner, repo] = repoName.split('/')
    const { data: issue } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
    })

    return issue
  } catch (error) {
    console.error('Error creating GitHub issue:', error)
    throw error
  }
}

export async function commitFileToRepo(
  repoName: string,
  path: string,
  content: string,
  message: string
) {
  try {
    const githubConnection = await getGitHubConnection()
    const octokit = new Octokit({
      auth: githubConnection.accessToken,
    })

    const [owner, repo] = repoName.split('/')
    
    // Get the current file if it exists
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      })

      if ('sha' in existingFile) {
        // Update existing file
        const { data: commit } = await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
          sha: existingFile.sha,
        })

        return commit
      }
    } catch (error: any) {
      if (error.status !== 404) {
        throw error
      }
    }

    // Create new file
    const { data: commit } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
    })

    return commit
  } catch (error) {
    console.error('Error committing file to GitHub:', error)
    throw error
  }
} 
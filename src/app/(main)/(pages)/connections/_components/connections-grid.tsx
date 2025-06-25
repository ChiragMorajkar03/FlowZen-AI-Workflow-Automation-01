'use client'

import { ConnectionTypes } from '@/lib/types'
import ConnectionCard from './connection-card'
import { DiscordIcon, SlackIcon, NotionIcon, MailIcon, GitHubIcon } from '@/components/icons'

type Props = {
  connections: {
    Discord?: boolean
    Slack?: boolean
    Notion?: boolean
    Email?: boolean
    GitHub?: boolean
  }
}

const ConnectionsGrid = ({ connections }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ConnectionCard
        title="Discord"
        description="Connect your Discord server"
        icon={<DiscordIcon />}
        type="Discord"
        connected={connections?.Discord}
        callback={() => window.location.href = process.env.NEXT_PUBLIC_DISCORD_REDIRECT!}
      />
      <ConnectionCard
        title="Slack"
        description="Connect your Slack workspace"
        icon={<SlackIcon />}
        type="Slack"
        connected={connections?.Slack}
        callback={() => window.location.href = process.env.NEXT_PUBLIC_SLACK_REDIRECT!}
      />
      <ConnectionCard
        title="Notion"
        description="Connect your Notion workspace"
        icon={<NotionIcon />}
        type="Notion"
        connected={connections?.Notion}
        callback={() => window.location.href = process.env.NEXT_PUBLIC_NOTION_AUTH_URL!}
      />
      <ConnectionCard
        title="Email"
        description="Connect your email account"
        icon={<MailIcon />}
        type="Email"
        connected={connections?.Email}
        callback={() => window.location.href = '/connections/email'}
      />
      <ConnectionCard
        title="GitHub"
        description="Connect your GitHub account"
        icon={<GitHubIcon />}
        type="GitHub"
        connected={connections?.GitHub}
        callback={() => window.location.href = process.env.NEXT_PUBLIC_GITHUB_REDIRECT!}
      />
    </div>
  )
}

export default ConnectionsGrid 
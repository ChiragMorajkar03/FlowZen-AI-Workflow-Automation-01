'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

type Props = {
  title: string
  description: string
  image: string
  isConnected: boolean
}

const ConnectionCard = ({ title, description, image, isConnected }: Props) => {
  const handleConnect = () => {
    switch (title) {
      case 'Discord':
        window.location.href = process.env.NEXT_PUBLIC_DISCORD_REDIRECT!
        break
      case 'Slack':
        window.location.href = process.env.NEXT_PUBLIC_SLACK_REDIRECT!
        break
      case 'Notion':
        window.location.href = process.env.NEXT_PUBLIC_NOTION_AUTH_URL!
        break
      case 'Email':
        window.location.href = '/connections/email'
        break
      case 'GitHub':
        window.location.href = process.env.NEXT_PUBLIC_GITHUB_REDIRECT!
        break
      default:
        break
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <Button
        variant={isConnected ? "outline" : "default"}
        onClick={handleConnect}
        className="w-full"
      >
        {isConnected ? 'Connected' : 'Connect'}
      </Button>
    </div>
  )
}

export default ConnectionCard

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function EmailConnection() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const emailAddress = formData.get('emailAddress') as string
    const smtpHost = formData.get('smtpHost') as string
    const smtpPort = formData.get('smtpPort') as string
    const smtpUser = formData.get('smtpUser') as string
    const smtpPass = formData.get('smtpPass') as string

    try {
      const response = await fetch('/api/connections/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress,
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPass,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to connect email')
      }

      toast.success('Email connected successfully')
      router.push('/connections')
    } catch (error) {
      toast.error('Failed to connect email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Connect Email</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-2">
          <Label htmlFor="emailAddress">Email Address</Label>
          <Input
            id="emailAddress"
            name="emailAddress"
            type="email"
            required
            placeholder="your@email.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="smtpHost">SMTP Host</Label>
          <Input
            id="smtpHost"
            name="smtpHost"
            required
            placeholder="smtp.gmail.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="smtpPort">SMTP Port</Label>
          <Input
            id="smtpPort"
            name="smtpPort"
            type="number"
            required
            placeholder="587"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="smtpUser">SMTP Username</Label>
          <Input
            id="smtpUser"
            name="smtpUser"
            required
            placeholder="your@email.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="smtpPass">SMTP Password</Label>
          <Input
            id="smtpPass"
            name="smtpPass"
            type="password"
            required
            placeholder="your-app-specific-password"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect Email'}
        </Button>
      </form>
    </div>
  )
} 
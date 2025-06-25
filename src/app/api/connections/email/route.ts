import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs'
import { onEmailConnect } from '@/app/(main)/(pages)/connections/_actions/email-connection'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { emailAddress, smtpHost, smtpPort, smtpUser, smtpPass } = body

    if (!emailAddress || !smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const result = await onEmailConnect(
      emailAddress,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      user.id
    )

    if (result.error) {
      return new NextResponse(result.error, { status: 500 })
    }

    return new NextResponse('Email connected successfully', { status: 200 })
  } catch (error) {
    console.error('Error connecting email:', error)
    return new NextResponse('Failed to connect email', { status: 500 })
  }
} 
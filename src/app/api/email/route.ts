import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { to, subject, text, html, workflowId } = await req.json()

    if (!to || !subject || (!text && !html)) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Get email configuration from workflow
    const workflow = await db.workflows.findUnique({
      where: { id: workflowId },
      select: { emailConfig: true }
    })

    if (!workflow?.emailConfig) {
      return new NextResponse('Email configuration not found', { status: 404 })
    }

    const emailConfig = JSON.parse(workflow.emailConfig)

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: true,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPass,
      },
    })

    // Email options
    const mailOptions = {
      from: emailConfig.smtpUser,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    }

    // Send email
    await transporter.sendMail(mailOptions)
    return new NextResponse('Email sent successfully', { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return new NextResponse('Failed to send email', { status: 500 })
  }
} 
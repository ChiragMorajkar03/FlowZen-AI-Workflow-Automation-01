'use server'

import { db } from '@/lib/db'
import nodemailer from 'nodemailer'

export const getEmailConnection = async () => {
  try {
    const emailConnection = await db.email.findFirst({
      include: {
        connections: true,
      },
    })

    if (!emailConnection) {
      return { success: false, error: 'No email connection found' }
    }

    return {
      success: true,
      emailAddress: emailConnection.emailAddress,
      smtpHost: emailConnection.smtpHost,
      smtpPort: emailConnection.smtpPort,
      smtpUser: emailConnection.smtpUser,
      smtpPass: emailConnection.smtpPass,
    }
  } catch (error) {
    console.error('Error getting email connection:', error)
    return { success: false, error }
  }
}

export const onEmailConnect = async (
  email: string,
  smtpHost: string,
  smtpPort: number,
  smtpUser: string,
  smtpPass: string,
  userId: string
) => {
  try {
    // Check if email connection already exists
    const existingEmail = await db.email.findFirst({
      where: { userId },
      include: { connections: true },
    })

    if (existingEmail) {
      return { success: false, error: 'Email connection already exists' }
    }

    // Create new email connection
    await db.email.create({
      data: {
        emailAddress: email,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        userId,
        connections: {
          create: {
            type: 'Email',
            userId,
          },  
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error connecting email:', error)
    return { success: false, error }
  }
}

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
) => {
  try {
    const emailConnection = await db.email.findFirst({
      include: {
        connections: true,
      },
    })

    if (!emailConnection) {
      throw new Error('No email connection found')
    }

    const transporter = nodemailer.createTransport({
      host: emailConnection.smtpHost || '',
      port: emailConnection.smtpPort || 587,
      secure: emailConnection.smtpPort === 465,
      auth: {
        user: emailConnection.smtpUser || '',
        pass: emailConnection.smtpPass || '',
      },
    })

    const mailOptions = {
      from: emailConnection.emailAddress,
      to,
      subject,
      text,
      attachments,
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
} 
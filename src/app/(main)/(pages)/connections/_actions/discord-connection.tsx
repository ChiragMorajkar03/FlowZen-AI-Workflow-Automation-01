'use server'

import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs'
import axios from 'axios'
import { GoogleFile } from '@/lib/google-file-types'

export const onDiscordConnect = async (
  channel_id: string,
  webhook_id: string,
  webhook_name: string,
  webhook_url: string,
  id: string,
  guild_name: string,
  guild_id: string
) => {
  //check if webhook id params set
  if (webhook_id) {
    //check if webhook exists in database with userid
    const webhook = await db.discordWebhook.findFirst({
      where: {
        userId: id,
      },
      include: {
        connections: {
          select: {
            type: true,
          },
        },
      },
    })

    //if webhook does not exist for this user
    if (!webhook) {
      //create new webhook
      await db.discordWebhook.create({
        data: {
          userId: id,
          webhookId: webhook_id,
          channelId: channel_id!,
          guildId: guild_id!,
          name: webhook_name!,
          url: webhook_url!,
          guildName: guild_name!,
          connections: {
            create: {
              userId: id,
              type: 'Discord',
            },
          },
        },
      })
    }

    //if webhook exists return check for duplicate
    if (webhook) {
      //check if webhook exists for target channel id
      const webhook_channel = await db.discordWebhook.findUnique({
        where: {
          channelId: channel_id,
        },
        include: {
          connections: {
            select: {
              type: true,
            },
          },
        },
      })

      //if no webhook for channel create new webhook
      if (!webhook_channel) {
        await db.discordWebhook.create({
          data: {
            userId: id,
            webhookId: webhook_id,
            channelId: channel_id!,
            guildId: guild_id!,
            name: webhook_name!,
            url: webhook_url!,
            guildName: guild_name!,
            connections: {
              create: {
                userId: id,
                type: 'Discord',
              },
            },
          },
        })
      }
    }
  }
}

export const getDiscordConnectionUrl = async () => {
  const user = await currentUser()
  if (user) {
    const webhook = await db.discordWebhook.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        url: true,
        name: true,
        guildName: true,
      },
    })

    return webhook
  }
}

export const postContentToWebHook = async (
  content: string,
  url: string,
  attachments?: GoogleFile[]
) => {
  if (content === '') {
    return { message: 'String empty' };
  }

  try {
    const message: any = { content };

    if (attachments && attachments.length > 0) {
      message.embeds = attachments.map(file => ({
        title: file.name,
        url: file.webViewLink,
        description: "Click to view file in Google Drive",
        color: 4886754 // Google Drive blue color in decimal
      }));
    }

    const posted = await axios.post(url, message);
    if (posted) {
      return { message: 'success' };
    }
    return { message: 'failed request' };
  } catch (error) {
    console.error('Error posting to Discord:', error);
    return { message: 'failed request' };
  }
};
'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNodeConnections } from '@/providers/connections-provider'
import { useEditor } from '@/providers/editor-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { getEmailConnection, sendEmail } from '@/app/(main)/(pages)/connections/_actions/email-connection'
import { toast } from 'sonner'

const formSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
})

type Props = {}

const EmailActions = (props: Props) => {
  const { state, dispatch } = useEditor()
  const { nodeConnection } = useNodeConnections()
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: '',
      subject: '',
      body: '',
    },
  })

  useEffect(() => {
    const initializeEmail = async () => {
      try {
        setLoading(true)
        const connection = await getEmailConnection()
        
        if (connection?.success) {
          setIsConnected(true)
          nodeConnection.setEmailNode({
            email: connection.emailAddress,
            smtpHost: connection.smtpHost,
            smtpPort: connection.smtpPort,
            smtpUser: connection.smtpUser,
            smtpPass: connection.smtpPass,
          })
        } else {
          setIsConnected(false)
          nodeConnection.setEmailNode({
            email: '',
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpPass: '',
          })
        }
      } catch (error) {
        console.error('Error initializing email:', error)
        setIsConnected(false)
        nodeConnection.setEmailNode({
          email: '',
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPass: '',
        })
      } finally {
        setLoading(false)
      }
    }

    initializeEmail()
  }, [])

  useEffect(() => {
    if (nodeConnection.emailNode?.email) {
      setIsConnected(true)
    } else {
      setIsConnected(false)
    }
  }, [nodeConnection.emailNode])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      const selectedElement = state.editor.elements.find(
        (el) => el.id === state.editor.selectedNode?.id
      )

      if (!selectedElement) {
        toast.error('No node selected')
        return
      }

      // First, send the email
      const emailResult = await sendEmail(
        values.to,
        values.subject,
        values.body
      )

      if (!emailResult.success) {
        toast.error('Failed to send email')
        return
      }

      // Then update the node metadata
      const updatedNode = {
        ...selectedElement,
        data: {
          ...selectedElement.data,
          metadata: {
            ...selectedElement.data.metadata,
            to: values.to,
            subject: values.subject,
            body: values.body,
          },
        },
      }

      // Create the updated elements array
      const updatedElements = state.editor.elements.map((el) =>
        el.id === selectedElement.id ? updatedNode : el
      )

      // Dispatch the update
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          elements: updatedElements,
          edges: state.editor.edges,
        },
      })

      toast.success('Email sent successfully')
      form.reset() // Reset form after successful submission
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <p className="text-sm text-gray-500">
          Please connect your email account to use this action.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/connections'}
          className="w-full"
        >
          Connect Email
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4 p-4"
      >
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To</FormLabel>
              <FormControl>
                <Input placeholder="recipient@example.com" {...field} />
              </FormControl>
              <FormDescription>
                The email address of the recipient
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Enter email subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter email content"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Send Email'}
        </Button>
      </form>
    </Form>
  )
}

export default EmailActions 
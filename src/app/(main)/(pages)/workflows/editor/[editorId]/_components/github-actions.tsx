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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useNodeConnections } from '@/providers/connections-provider'
import { useEditor } from '@/providers/editor-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { getGitHubConnection, getGitHubRepositories, createGitHubIssue, commitFileToRepo } from '@/app/(main)/(pages)/connections/_actions/github-connection'
import { useFuzzieStore } from '@/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

const formSchema = z.object({
  action: z.enum(['create_issue', 'commit_file']),
  repository: z.string().min(1, 'Repository is required'),
  title: z.string().optional(),
  body: z.string().optional(),
  path: z.string().optional(),
  content: z.string().optional(),
  message: z.string().optional(),
  fileSource: z.enum(['drive', 'device']).optional(),
}).superRefine((data, ctx) => {
  if (data.action === 'create_issue') {
    if (!data.title) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Title is required for creating an issue",
        path: ["title"]
      });
    }
    if (!data.body) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Body is required for creating an issue",
        path: ["body"]
      });
    }
  } else if (data.action === 'commit_file') {
    if (!data.path) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File path is required for committing a file",
        path: ["path"]
      });
    }
    if (!data.message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Commit message is required",
        path: ["message"]
      });
    }
  }
});

interface Repository {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  default_branch: string
}

interface GoogleDriveFile {
  id: string
  name: string
  content?: string
}

type Props = {}

const GitHubActions = (props: Props) => {
  const { state, dispatch } = useEditor()
  const { nodeConnection } = useNodeConnections()
  const { googleFile } = useFuzzieStore()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDriveFile, setSelectedDriveFile] = useState<GoogleDriveFile | null>(null)
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: 'create_issue',
      repository: '',
      title: '',
      body: '',
      path: '',
      content: '',
      message: '',
      fileSource: undefined,
    },
  })

  const watchAction = form.watch('action')
  const watchFileSource = form.watch('fileSource')

  useEffect(() => {
    const initializeGitHub = async () => {
      try {
        setLoading(true)
        const connection = await getGitHubConnection()
        
        if (connection?.accessToken) {
          nodeConnection.setGitHubNode({ token: connection.accessToken })
          setIsConnected(true)
          
          try {
            const repos = await getGitHubRepositories()
            console.log('Fetched repositories:', repos) // Debug log
            if (repos && Array.isArray(repos)) {
              setRepositories(repos)
            }
          } catch (error) {
            console.error('Error fetching repositories:', error)
          }
        } else {
          setIsConnected(false)
          nodeConnection.setGitHubNode({ token: '' })
        }
      } catch (error) {
        console.error('Error initializing GitHub:', error)
        setIsConnected(false)
        nodeConnection.setGitHubNode({ token: '' })
      } finally {
        setLoading(false)
      }
    }

    initializeGitHub()
  }, [])

  useEffect(() => {
    if (nodeConnection.githubNode?.token) {
      setIsConnected(true)
    } else {
      setIsConnected(false)
    }
  }, [nodeConnection.githubNode])

  // Update drive files when googleFile changes
  useEffect(() => {
    console.log('Google Drive files:', googleFile) // Debug log
    if (googleFile?.files && Array.isArray(googleFile.files)) {
      setDriveFiles(googleFile.files)
    } else {
      setDriveFiles([])
    }
  }, [googleFile])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      form.setValue('path', file.name)
      // Read file content
      const reader = new FileReader()
      reader.onload = (e) => {
        form.setValue('content', e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const handleDriveFileSelect = (file: GoogleDriveFile) => {
    setSelectedDriveFile(file)
    form.setValue('path', file.name)
    form.setValue('content', file.content || '')
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('Form values:', values); // Debug log
      setLoading(true);

      const selectedElement = state.editor.elements.find(
        (el) => el.id === state.editor.selectedNode?.id
      );

      if (!selectedElement) {
        toast.error('No node selected');
        return;
      }

      if (!values.repository) {
        toast.error('Please select a repository');
        return;
      }

      if (values.action === 'create_issue') {
        console.log('Creating issue with:', { 
          repository: values.repository,
          title: values.title,
          body: values.body 
        }); // Debug log

        if (!values.title || !values.body) {
          toast.error('Title and body are required for creating an issue');
          return;
        }

        const result = await createGitHubIssue(
          values.repository,
          values.title,
          values.body
        );
        console.log('Issue creation result:', result); // Debug log
        toast.success('Issue created successfully');
      } else if (values.action === 'commit_file') {
        console.log('Committing file with:', { 
          repository: values.repository,
          path: values.path,
          message: values.message,
          content: values.content?.substring(0, 100) + '...' // Log first 100 chars
        }); // Debug log

        if (!values.path || !values.message) {
          toast.error('File path and commit message are required');
          return;
        }

        if (!values.content) {
          toast.error('File content is required');
          return;
        }

        const result = await commitFileToRepo(
          values.repository,
          values.path,
          values.content,
          values.message
        );
        console.log('File commit result:', result); // Debug log
        toast.success('File committed successfully');
      }

      // Update node metadata after successful action
      dispatch({
        type: 'UPDATE_NODE',
        payload: {
          elements: state.editor.elements.map((el) =>
            el.id === selectedElement.id
              ? {
                  ...el,
                  data: {
                    ...el.data,
                    completed: true,
                    metadata: {
                      ...values,
                      token: nodeConnection.githubNode?.token,
                    },
                  },
                }
              : el
          ),
        },
      });

      form.reset(); // Reset form after successful submission
    } catch (error: any) {
      console.error('Error performing GitHub action:', error);
      toast.error(error.message || 'Failed to perform GitHub action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <p className="text-sm text-gray-500">
          Please connect your GitHub account to use this action.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/connections'}
          className="w-full"
        >
          Connect GitHub
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
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="create_issue">Create Issue</SelectItem>
                  <SelectItem value="commit_file">Commit File</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the GitHub action to perform
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repository"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {repositories.length > 0 ? (
                      repositories.map((repo) => (
                        <SelectItem key={repo.id} value={repo.full_name}>
                          {repo.full_name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No repositories found
                      </div>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the repository to perform the action on
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchAction === 'create_issue' && (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter issue title" {...field} />
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
                  <FormLabel>Issue Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter issue description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {watchAction === 'commit_file' && (
          <>
            <FormField
              control={form.control}
              name="fileSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Source</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select file source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="drive">Google Drive</SelectItem>
                      <SelectItem value="device">Local Device</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchFileSource === 'device' && (
              <FormItem>
                <FormLabel>Select File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}

            {watchFileSource === 'drive' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Select from Google Drive
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Select File from Google Drive</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {driveFiles && driveFiles.length > 0 ? (
                        driveFiles.map((file: GoogleDriveFile) => (
                          <div
                            key={file.id}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                            onClick={() => {
                              handleDriveFileSelect(file)
                              form.setValue('fileSource', 'drive')
                            }}
                          >
                            {file.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No files found in Google Drive. Make sure you have connected your Google Drive account.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}

            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Path</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter file path (e.g., docs/README.md)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The path where the file will be created or updated
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commit Message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter commit message"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Save Action'}
        </Button>
      </form>
    </Form>
  )
}

export default GitHubActions 
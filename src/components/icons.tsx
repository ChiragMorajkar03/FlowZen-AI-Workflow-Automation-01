import { MessageSquare, Github, Mail, FileText, Slack } from 'lucide-react'

export const DiscordIcon = () => (
  <MessageSquare className="h-6 w-6 text-[#5865F2]" />
)

export const SlackIcon = () => (
  <Slack className="h-6 w-6 text-[#4A154B]" />
)

export const NotionIcon = () => (
  <FileText className="h-6 w-6 text-black dark:text-white" />
)

export const MailIcon = () => (
  <Mail className="h-6 w-6 text-[#EA4335]" />
)

export const GitHubIcon = () => (
  <Github className="h-6 w-6 text-black dark:text-white" />
) 
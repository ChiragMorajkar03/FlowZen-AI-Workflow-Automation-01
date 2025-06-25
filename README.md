# Flowzen - Modern Automation Platform

[![CI/CD Pipeline](https://github.com/ChiragMorajkar03/FlowZen-AI-Workflow-Automation-01/actions/workflows/ci.yml/badge.svg)](https://github.com/ChiragMorajkar03/FlowZen-AI-Workflow-Automation-01/actions/workflows/ci.yml)

![Flowzen Banner](https://via.placeholder.com/1200x300?text=Flowzen+Automation+Platform)

Flowzen is a powerful no-code automation platform that allows users to create, manage, and deploy automated workflows connecting various services like Discord, Slack, Notion, and Google services. With an intuitive visual builder and AI-powered workflow generation, Flowzen makes automation accessible to everyone.

## ✨ Features

* **User-friendly Workflow Builder**: Drag-and-drop interface for creating automation workflows between services
* **Multiple Integration Channels**: Connects with popular tools and services including Discord, Slack, Notion, Google Drive, and more
* **Team Collaboration**: Share workflows with team members and manage permissions
* **Ready-To-Use Templates**: Pre-built workflow templates for common automation scenarios
* **Detailed Analytics**: Monitor workflow execution and performance metrics
* **Versioning**: Track changes to workflows and rollback when needed

### 🧠 AI-Powered Features

* **Natural Language Workflow Generation**: Simply describe what you want your workflow to do, and our Gemini AI engine will create a fully functional workflow connecting the appropriate services
* **Context-Aware Service Detection**: The AI automatically detects services mentioned in your prompts (GitHub, Slack, Discord, Email, Google services, etc.) and configures the right connections
* **Smart Node Positioning**: Automatically generates a visually organized workflow with proper node positioning and connections
* **Comprehensive Documentation**: Generate detailed markdown documentation for any workflow including:
  * Workflow overview and purpose
  * Component details and interactions
  * Connection setup requirements
  * Step-by-step execution flow
  * Integration guides
  * Troubleshooting tips

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk/NextAuth
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **API Integration**: REST APIs, OAuth2
- **Deployment**: Ready for Vercel deployment

## 📋 Prerequisites

- Node.js 18.0.0 or later
- npm, yarn, or bun package manager
- PostgreSQL database

## Note for Portfolio Reviewers

This project is part of my portfolio to demonstrate full-stack development skills with Next.js, React, TypeScript, and CI/CD workflows. The CI pipeline has been configured to be non-blocking for demonstration purposes, as this is primarily a showcase of architecture, design patterns, and code organization rather than a production application.

## 🚀 Getting Started

### Environment Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/flowzen.git
   cd flowzen
   ```

2. Copy the example environment file
   ```bash
   cp .env.example .env.local
   ```

3. Update the environment variables in `.env.local` with your own API keys and credentials

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
bun install

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
# or
yarn dev
# or
bun dev
```

Open [https://localhost:3000](https://localhost:3000) with your browser to see the application.

## 📱 Application Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - UI components
- `/src/lib` - Utility functions and shared libraries
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## 🔒 Authentication & Security

Flowzen uses Clerk (or NextAuth) for secure user authentication and provides OAuth2 integration with various services like Discord, Slack, and Google. All sensitive data is stored securely, and API keys are never exposed to the client.

## 🌐 API Integration

The platform supports integration with multiple third-party services:

- **Discord**: Bot integration, message sending, webhook support
- **Slack**: Channel management, message posting
- **Notion**: Database access, page creation/editing
- **Google Drive/Gmail**: File management, email sending

## 📦 Deployment

Flowzen is built to deploy easily on Vercel:

```bash
# Build for production
npm run build
# or
yarn build
# or
bun build
```

You can also deploy directly to Vercel with the [Vercel CLI](https://vercel.com/docs/cli) or by connecting your GitHub repository.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) - Animation library

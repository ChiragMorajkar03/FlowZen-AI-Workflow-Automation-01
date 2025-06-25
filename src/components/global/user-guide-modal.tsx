import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            User Guide
          </DialogTitle>
          <DialogDescription>
            A comprehensive guide to help you get started with workflow automation
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Getting Started Section */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
              <div className="space-y-4">
                <p>
                  Welcome to the Workflow Automation System! This guide will help you understand how to create and manage your workflows effectively.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Quick Start</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Create a new workflow using the + button</li>
                    <li>Add nodes to define your automation steps</li>
                    <li>Connect nodes to create the workflow</li>
                    <li>Configure each node's settings</li>
                    <li>Test and publish your workflow</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Workflow Components Section */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Workflow Components</h2>
              <div className="space-y-4">
                <h3 className="font-medium">Nodes</h3>
                <p>Nodes are the building blocks of your workflow. Each node performs a specific action:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Trigger Nodes: Start your workflow</li>
                  <li>Action Nodes: Perform specific tasks</li>
                  <li>Condition Nodes: Add logic to your workflow</li>
                  <li>Integration Nodes: Connect with external services</li>
                </ul>
              </div>
            </section>

            {/* Creating Workflows Section */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Creating Workflows</h2>
              <div className="space-y-4">
                <h3 className="font-medium">Step-by-Step Guide</h3>
                <ol className="list-decimal pl-5 space-y-4">
                  <li>
                    <strong>Create a New Workflow</strong>
                    <p className="mt-1">Click the + button in the workflows page to create a new workflow.</p>
                  </li>
                  <li>
                    <strong>Add Nodes</strong>
                    <p className="mt-1">Drag and drop nodes from the sidebar to the canvas.</p>
                  </li>
                  <li>
                    <strong>Connect Nodes</strong>
                    <p className="mt-1">Click and drag from one node's output to another node's input to create connections.</p>
                  </li>
                  <li>
                    <strong>Configure Settings</strong>
                    <p className="mt-1">Double-click nodes to configure their settings and parameters.</p>
                  </li>
                </ol>
              </div>
            </section>

            {/* Best Practices Section */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Best Practices</h2>
              <div className="space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Start with simple workflows and gradually add complexity</li>
                  <li>Use descriptive names for your workflows and nodes</li>
                  <li>Test your workflow before publishing</li>
                  <li>Document your workflow using the documentation generator</li>
                  <li>Monitor workflow performance regularly</li>
                </ul>
              </div>
            </section>

            {/* Troubleshooting Section */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Common Issues</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Connection issues with external services</li>
                    <li>Node configuration errors</li>
                    <li>Workflow execution failures</li>
                  </ul>
                </div>
                <p>If you encounter any issues, try the following:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Check node configurations</li>
                  <li>Verify service connections</li>
                  <li>Review error logs</li>
                  <li>Contact support if needed</li>
                </ol>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserGuideModal; 
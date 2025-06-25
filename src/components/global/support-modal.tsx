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
import { Headphones, BookOpen, Users, HelpCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Support Center
          </DialogTitle>
          <DialogDescription>
            Get help and support for your workflow automation needs
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] pr-4">
            <TabsContent value="knowledge" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Knowledge Base</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Getting Started</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="cursor-pointer hover:underline">First Workflow Guide</li>
                      <li className="cursor-pointer hover:underline">Basic Concepts</li>
                      <li className="cursor-pointer hover:underline">System Requirements</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Advanced Topics</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="cursor-pointer hover:underline">API Integration</li>
                      <li className="cursor-pointer hover:underline">Custom Nodes</li>
                      <li className="cursor-pointer hover:underline">Performance Optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="community" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Community Support</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm mb-4">
                    Join our community of workflow automation experts and enthusiasts.
                  </p>
                  <div className="space-y-4">
                    <Button className="w-full">Visit Community Forum</Button>
                    <Button variant="outline" className="w-full">Feature Requests</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">How do I create my first workflow?</h4>
                    <p className="text-sm">
                      Start by clicking the + button in the workflows page. Follow our step-by-step guide in the User Guide section.
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What are the system requirements?</h4>
                    <p className="text-sm">
                      Our system works on all modern browsers. No special hardware requirements needed.
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">How do I integrate with external services?</h4>
                    <p className="text-sm">
                      Use our integration nodes to connect with various services. Check the Knowledge Base for specific integration guides.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal; 
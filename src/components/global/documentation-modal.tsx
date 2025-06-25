import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowData: {
    name: string;
    description: string;
    nodes: any[];
    edges: any[];
    connections: any[];
  };
}

const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  workflowData,
}) => {
  const [documentation, setDocumentation] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const generateDocumentation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workflows/documentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate documentation');
      }

      const data = await response.json();
      setDocumentation(data.documentation);
    } catch (error) {
      toast.error('Failed to generate documentation');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      generateDocumentation();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workflow Documentation</DialogTitle>
          <DialogDescription>
            Generated documentation for {workflowData.name}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{documentation}</ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentationModal; 
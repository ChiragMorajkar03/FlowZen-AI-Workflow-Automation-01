import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import axios from 'axios';
import { toast } from 'sonner';

interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

interface Props {
  onFileSelect: (files: GoogleFile[]) => void;
  selectedFiles: GoogleFile[];
}

const GoogleDriveFileSelector = ({ onFileSelect, selectedFiles }: Props) => {
  const [files, setFiles] = useState<GoogleFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/drive/files');
      if (response.data?.files) {
        setFiles(response.data.files);
      }
    } catch (error) {
      toast.error('Failed to fetch files from Google Drive');
    }
    setLoading(false);
  };

  const handleFileToggle = (file: GoogleFile) => {
    const isSelected = selectedFiles.some((f) => f.id === file.id);
    if (isSelected) {
      onFileSelect(selectedFiles.filter((f) => f.id !== file.id));
    } else {
      onFileSelect([...selectedFiles, file]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Files from Google Drive</CardTitle>
        <CardDescription>Choose files to attach to your message</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full rounded-md border p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => handleFileToggle(file)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedFiles.some((f) => f.id === file.id)}
                    onChange={() => handleFileToggle(file)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.mimeType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={fetchFiles}>
            Refresh Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleDriveFileSelector; 
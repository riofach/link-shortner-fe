
import { useState } from 'react';
import { Copy, Check, ExternalLink, BarChart2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LinkCardProps {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
  onDelete: (id: string) => void;
}

const LinkCard = ({ id, originalUrl, shortUrl, createdAt, clicks, onDelete }: LinkCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${shortUrl}`);
    setCopied(true);
    toast.success("Copied to clipboard!");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const truncateUrl = (url: string, maxLength = 40) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  const handleDelete = () => {
    onDelete(id);
    toast.success("Link deleted successfully");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900 mb-1 break-all">
            {truncateUrl(originalUrl)}
          </h3>
          <div className="flex items-center text-primary font-medium">
            linkstride.com/{shortUrl.split('/').pop()}
          </div>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-primary" 
            onClick={handleCopy}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-primary"
            asChild
          >
            <a href={`https://${shortUrl}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} />
            </a>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 mt-3 text-sm">
        <div className="flex space-x-4">
          <div className="text-gray-500">
            Created: {new Date(createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-500">
            <BarChart2 size={16} className="mr-1" />
            {clicks} clicks
          </div>
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            asChild
          >
            <a href={`/analytics/${id}`}>
              <BarChart2 size={14} className="mr-1" />
              Stats
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;

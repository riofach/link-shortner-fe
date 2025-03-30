
import { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { url: string; customAlias?: string }) => void;
}

const UrlModal = ({ isOpen, onClose, onSubmit }: UrlModalProps) => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    try {
      // Basic URL validation
      new URL(url);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Generate a short URL or use custom alias
    const alias = customAlias || Math.random().toString(36).substring(2, 8);
    const generatedUrl = `linkstride.com/${alias}`;
    setShortUrl(generatedUrl);

    // Pass data to parent component
    onSubmit({ url, customAlias });
  };

  const handleCopy = () => {
    if (!shortUrl) return;
    
    navigator.clipboard.writeText(`https://${shortUrl}`);
    setCopied(true);
    toast.success("Copied to clipboard!");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Create New Link</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">URL to shorten</Label>
              <Input
                id="url"
                type="text"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="customAlias">Custom alias (optional)</Label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md text-gray-500 text-sm">
                  linkstride.com/
                </span>
                <Input
                  id="customAlias"
                  type="text"
                  placeholder="my-custom-url"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for a randomly generated alias
              </p>
            </div>

            {shortUrl && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Your shortened URL</p>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-medium">https://{shortUrl}</p>
                  <Button
                    type="button"
                    variant="ghost" 
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {shortUrl ? 'Create Another' : 'Create Link'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UrlModal;

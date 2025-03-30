
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Loader2 } from 'lucide-react';
import { toast } from "sonner";

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    
    // In a real app, this would call an API
    setTimeout(() => {
      // Generate a random short code
      const shortCode = Math.random().toString(36).substring(2, 8);
      const generatedUrl = `linkstride.com/${shortCode}`;
      setShortUrl(generatedUrl);
      setIsLoading(false);
      toast.success("URL shortened successfully!");
    }, 1000);
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Paste your long URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 bg-white"
          />
        </div>
        <Button 
          type="submit" 
          className="h-12 px-6 font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Shorten URL"
          )}
        </Button>
      </form>

      {shortUrl && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between animate-fade-in">
          <div className="flex-1 mb-3 md:mb-0">
            <p className="text-sm text-gray-500 mb-1">Your shortened URL</p>
            <p className="text-lg font-medium text-gray-900">https://{shortUrl}</p>
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="min-w-[100px]"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;

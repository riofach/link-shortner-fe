
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import LinkCard from '@/components/LinkCard';
import UrlModal from '@/components/UrlModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Link2, Users, Globe, Plus, Search, SlidersHorizontal } from 'lucide-react';

// Mock data
const mockLinks = [
  {
    id: '1',
    originalUrl: 'https://www.example.com/very/long/url/that/needs/to/be/shortened/for/better/usability/and/tracking',
    shortUrl: 'linkstride.com/abc123',
    createdAt: '2023-05-15T12:30:00Z',
    clicks: 248
  },
  {
    id: '2',
    originalUrl: 'https://www.another-example.com/blog/10-tips-for-effective-link-management-strategies',
    shortUrl: 'linkstride.com/tips10',
    createdAt: '2023-05-10T09:15:00Z',
    clicks: 532
  },
  {
    id: '3',
    originalUrl: 'https://www.example-docs.com/documentation/api/v2/endpoints',
    shortUrl: 'linkstride.com/apidocs',
    createdAt: '2023-04-28T14:45:00Z',
    clicks: 189
  },
  {
    id: '4',
    originalUrl: 'https://www.example-store.com/products/summer-collection-2023',
    shortUrl: 'linkstride.com/summer23',
    createdAt: '2023-04-15T11:20:00Z',
    clicks: 976
  }
];

const Dashboard = () => {
  const [links, setLinks] = useState(mockLinks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLinks = links.filter(link => 
    link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.shortUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLink = (data: { url: string; customAlias?: string }) => {
    // In a real app, this would call an API to create the link
    const newLink = {
      id: (links.length + 1).toString(),
      originalUrl: data.url,
      shortUrl: `linkstride.com/${data.customAlias || Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      clicks: 0
    };

    setLinks([newLink, ...links]);
    setIsModalOpen(false);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Manage and track your shortened links</p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 md:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Link
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Total Links"
              value={links.length}
              icon={<Link2 size={24} />}
              trend={12}
              trendLabel="this month"
            />
            <StatsCard 
              title="Total Clicks"
              value="1,945"
              icon={<BarChart3 size={24} />}
              trend={8}
              trendLabel="this month"
            />
            <StatsCard 
              title="Unique Visitors"
              value="872"
              icon={<Users size={24} />}
              trend={-3}
              trendLabel="this month"
            />
            <StatsCard 
              title="Top Country"
              value="USA (42%)"
              icon={<Globe size={24} />}
            />
          </div>

          {/* Links Management */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Links</h2>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Search links..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex-shrink-0">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="p-6 divide-y divide-gray-100">
              {filteredLinks.length > 0 ? (
                filteredLinks.map(link => (
                  <div key={link.id} className="py-4 first:pt-0 last:pb-0">
                    <LinkCard 
                      id={link.id}
                      originalUrl={link.originalUrl}
                      shortUrl={link.shortUrl}
                      createdAt={link.createdAt}
                      clicks={link.clicks}
                      onDelete={handleDeleteLink}
                    />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No links found</p>
                </div>
              )}
            </div>

            {/* Pagination would go here in a real app */}
            <div className="p-6 border-t border-gray-100 flex justify-between items-center text-sm">
              <div className="text-gray-500">
                Showing {filteredLinks.length} of {links.length} links
              </div>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </div>
        </div>

        <UrlModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateLink}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

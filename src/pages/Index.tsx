
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UrlShortener from '@/components/UrlShortener';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, Shield, Zap, LineChart, Layers, Globe } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary to-white py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Shorten URLs, <span className="text-primary">Amplify Results</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10">
              Create short, memorable links in seconds. Track performance with detailed analytics and reach your audience more effectively.
            </p>
            
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg">
              <UrlShortener />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powerful features to supercharge your links
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to create, manage, and analyze your shortened links in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grid-animation">
              <FeatureCard 
                icon={<Zap size={24} />}
                title="Lightning Fast"
                description="Create short links instantly with our streamlined interface. No waiting, just results."
              />
              <FeatureCard 
                icon={<Shield size={24} />}
                title="Secure & Reliable"
                description="Bank-level security keeps your links and data safe. 99.9% uptime guarantee."
              />
              <FeatureCard 
                icon={<LineChart size={24} />}
                title="Detailed Analytics"
                description="Track clicks, visitor locations, devices, and referrers with real-time data."
              />
              <FeatureCard 
                icon={<Layers size={24} />}
                title="Custom URLs"
                description="Create branded, memorable links with your own custom aliases and domains."
              />
              <FeatureCard 
                icon={<BarChart3 size={24} />}
                title="Performance Dashboard"
                description="Monitor all your links in one place with our intuitive, data-rich dashboard."
              />
              <FeatureCard 
                icon={<Globe size={24} />}
                title="Global Reach"
                description="Optimize content delivery and track audience engagement worldwide."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20 px-6 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to take control of your links?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses and individuals who trust LinkStride for their link management needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-primary font-medium px-8">
                  Get Started — It's Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 font-medium px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

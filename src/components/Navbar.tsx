
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // This would use actual auth logic in a real app
  const handleLogout = () => {
    setIsLoggedIn(false);
    // Additional logout logic would go here
  };

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center space-x-2">
            <span className="text-3xl">⚡</span>
            <span>LinkStride</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors duration-200">
            Home
          </Link>
          <Link to="/features" className="text-gray-700 hover:text-primary transition-colors duration-200">
            Features
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-primary transition-colors duration-200">
            Pricing
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 focus:outline-none">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 py-4 px-6 bg-white animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors duration-200 py-2" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/features" className="text-gray-700 hover:text-primary transition-colors duration-200 py-2" onClick={() => setIsOpen(false)}>
              Features
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-primary transition-colors duration-200 py-2" onClick={() => setIsOpen(false)}>
              Pricing
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
                <Button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

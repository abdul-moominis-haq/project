'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Sprout, 
  Cloud, 
  Users, 
  Settings, 
  LogOut,
  Leaf,
  Menu,
  X,
  MessageSquare,
  User,
  Edit,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Crops & IoT', href: '/crops', icon: Sprout },
  { name: 'Weather & AI', href: '/weather', icon: Cloud },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, logout, refreshProfile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      // The logout function handles the redirect, so we don't need to do anything else
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfile();
    } catch (error) {
      console.error('Profile refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayLocation = profile?.location || user?.location || 'Location not set';

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo - Responsive sizing */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/dashboard" className="flex items-center space-x-1 sm:space-x-2">
                <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                <span className="text-lg sm:text-xl font-bold text-green-800 hidden xs:block">
                  SmartAgri
                </span>
                <span className="text-sm font-bold text-green-800 xs:hidden">
                  SA
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on mobile and small tablets */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 flex-1 justify-center">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-2 xl:px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap",
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:block">{item.name}</span>
                    <span className="xl:hidden">{item.name.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>

            {/* Tablet Navigation - Visible on medium screens */}
            <div className="hidden md:flex lg:hidden items-center space-x-2 flex-1 justify-center">
              {navigation.slice(0, 4).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center px-2 py-1 text-xs font-medium rounded-md transition-colors duration-200",
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="w-5 h-5 mb-1" />
                    <span>{item.name.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side - Desktop & Tablet */}
            <div className="hidden md:flex items-center space-x-3">
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                    <AvatarFallback className="bg-green-100 text-green-800 text-sm font-medium">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-32">
                      {displayLocation}
                    </p>
                  </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                        <AvatarFallback className="bg-green-100 text-green-800">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {displayEmail}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {displayLocation}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center w-full">
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleRefreshProfile}
                    disabled={isRefreshing}
                    className="flex items-center w-full"
                  >
                    <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Profile'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div 
              id="mobile-menu" 
              className="md:hidden border-t bg-white shadow-lg"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="mobile-menu-button"
            >
              {/* Main Navigation Grid */}
              <div className="px-3 py-4">
                {/* Mobile User Profile Section */}
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                      <AvatarFallback className="bg-green-100 text-green-800 text-lg font-medium">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {displayName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {displayEmail}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {displayLocation}
                      </p>
                    </div>
                  </div>
                  
                  {/* Profile Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center p-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Profile
                    </Link>
                    <Button
                      onClick={handleRefreshProfile}
                      disabled={isRefreshing}
                      className="flex items-center justify-center p-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-1", isRefreshing && "animate-spin")} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 border",
                          isActive
                            ? "bg-green-50 text-green-800 border-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                        )}
                      >
                        <item.icon className={cn(
                          "w-6 h-6 mb-2",
                          isActive ? "text-green-600" : "text-gray-500"
                        )} />
                        <span className="text-sm font-medium text-center leading-tight">
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Mobile Logout Button */}
                <div className="border-t pt-4">
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-center text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 bg-transparent"
                    disabled={isLoggingOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

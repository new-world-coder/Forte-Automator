'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from './ui/Button';
import { useFlowWallet } from '@/lib/hooks/useFlowWallet';
import { useAppNotifications } from '@/lib/contexts/NotificationContext';

export default function HeaderBar() {
  const { address, isConnected, loading, connectWallet, disconnectWallet, user } = useFlowWallet();
  const { showWalletConnected, showWalletDisconnected, showWalletError } = useAppNotifications();
  const pathname = usePathname();
  
  const displayAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const navigation = [
    { name: 'Dashboard', href: '/', current: pathname === '/' },
    { name: 'Agents', href: '/agents', current: pathname === '/agents' },
    { name: 'Settings', href: '/settings', current: pathname === '/settings' },
    { name: 'Testnet', href: '/testnet', current: pathname === '/testnet' },
  ];

  // Show notifications when wallet connection status changes
  useEffect(() => {
    if (user.loggedIn && address && !loading) {
      showWalletConnected(address);
    }
  }, [user.loggedIn, address, loading, showWalletConnected]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      showWalletError(error instanceof Error ? error.message : 'Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      showWalletDisconnected();
    } catch (error) {
      showWalletError(error instanceof Error ? error.message : 'Failed to disconnect wallet');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: App title and navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
              Forte Automator
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Wallet connection */}
          <div className="flex items-center space-x-4">
            {isConnected && address ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {displayAddress}
                  </span>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="text-xs"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnect} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect Flow Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

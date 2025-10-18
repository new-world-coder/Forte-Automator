import React from 'react';
import Button from './ui/Button';

interface HeaderBarProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export default function HeaderBar({ walletAddress, onConnectWallet }: HeaderBarProps) {
  const displayAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: App title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Forte Automator
            </h1>
          </div>

          {/* Right: Wallet connection */}
          <div className="flex items-center space-x-4">
            {walletAddress ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {displayAddress}
                </span>
              </div>
            ) : (
              <Button onClick={onConnectWallet}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import React, { useState } from 'react';
import HeaderBar from '@/components/HeaderBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b8D7dFCCB7c1bD2E5F');
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar 
        walletAddress={walletAddress}
        onConnectWallet={() => {}}
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and automation settings</p>
        </div>

        <div className="space-y-6">
          {/* Wallet Section */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet</h3>
            <div className="space-y-4">
              <Input
                label="Connected Wallet"
                value={walletAddress}
                onChange={() => {}}
                disabled
                placeholder="No wallet connected"
              />
              <Button variant="secondary">Change Wallet</Button>
            </div>
          </Card>

          {/* Gas Settings */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gas & Fees</h3>
            <div className="space-y-4">
              <Input
                label="Gas Price (Gwei)"
                value="20"
                onChange={() => {}}
                type="number"
                placeholder="Enter gas price"
              />
              <Input
                label="Max Gas Limit"
                value="300000"
                onChange={() => {}}
                type="number"
                placeholder="Enter gas limit"
              />
              <div className="text-sm text-gray-600">
                <p>Current balance: 0.5 FLOW</p>
                <Button variant="secondary" className="mt-2">Top Up Balance</Button>
              </div>
            </div>
          </Card>

          {/* Agent Settings */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Automation Agent</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Agent Enabled</h4>
                  <p className="text-sm text-gray-600">Allow the agent to execute automation rules</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agentEnabled}
                    onChange={(e) => setAgentEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* UI Settings */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Interface</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

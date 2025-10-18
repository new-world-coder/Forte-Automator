'use client';

import React, { useState, useEffect } from 'react';
import HeaderBar from '@/components/HeaderBar';
import ExecutionLogTable from '@/components/ExecutionLogTable';
import { ExecutionLog } from '@/lib/types';

export default function TestnetPage() {
  const [logs, setLogs] = useState<ExecutionLog[]>([
    {
      logId: '1',
      ruleId: 'test-rule',
      timestamp: new Date().toISOString(),
      status: 'Success',
    }
  ]);

  useEffect(() => {
    // Simulate execution logs updating every 10 seconds
    const interval = setInterval(() => {
      const newLog: ExecutionLog = {
        logId: `log-${Date.now()}`,
        ruleId: 'test-rule',
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.5 ? 'Success' : 'Failed',
        errorMessage: Math.random() > 0.5 ? undefined : 'Simulated error occurred',
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep only last 10 logs
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar 
        walletAddress="0x742d35Cc6634C0532925a3b8D7dFCCB7c1bD2E5F" 
        onConnectWallet={() => {}} 
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Testnet Simulation</h1>
          <p className="text-gray-600 mt-1">
            Live simulation of rule execution - updates every 10 seconds
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                This page simulates real-time rule execution on the Forte testnet. 
                New execution logs will appear automatically every 10 seconds to demonstrate 
                the automation system in action.
              </p>
            </div>
          </div>
        </div>

        <ExecutionLogTable logs={logs} />
      </main>
    </div>
  );
}

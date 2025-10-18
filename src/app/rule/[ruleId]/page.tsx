'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import HeaderBar from '@/components/HeaderBar';
import ExecutionLogTable from '@/components/ExecutionLogTable';
import { mockRules, mockExecutionLogs } from '@/lib/mockData';
import Button from '@/components/ui/Button';

export default function RuleDetailPage() {
  const params = useParams();
  const ruleId = params.ruleId as string;
  const rule = mockRules.find(r => r.id === ruleId);
  const logs = mockExecutionLogs.filter(log => log.ruleId === ruleId);

  if (!rule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderBar walletAddress="0x742d35Cc6634C0532925a3b8D7dFCCB7c1bD2E5F" onConnectWallet={() => {}} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Rule not found</h1>
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar walletAddress="0x742d35Cc6634C0532925a3b8D7dFCCB7c1bD2E5F" onConnectWallet={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link href="/" className="text-primary hover:text-blue-600 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Rule header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{rule.name}</h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  rule.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rule.status}
                </span>
                <span className="text-sm text-gray-500">
                  Last run: {new Date(rule.lastRunAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button>Edit</Button>
              <Button variant="secondary">
                {rule.status === 'Active' ? 'Pause' : 'Resume'}
              </Button>
              <Button variant="secondary" className="text-red-600 hover:text-red-700">
                Delete
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Condition (IF)</h3>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{rule.condition}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Action (THEN)</h3>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">Mock action - swap 0.1 ETH to USDC</p>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="secondary">
              Run Now (Test)
            </Button>
          </div>
        </div>

        {/* Execution logs */}
        <ExecutionLogTable logs={logs} />
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { ExecutionLog } from '@/lib/types';
import { useFlowWallet } from '@/lib/hooks/useFlowWallet';
import Button from './ui/Button';
import Card from './ui/Card';

interface ExecutionMonitorProps {
  ruleId?: string;
  showAll?: boolean;
}

export default function ExecutionMonitor({ ruleId, showAll = true }: ExecutionMonitorProps) {
  const { isConnected, address } = useFlowWallet();
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock execution data - in production this would come from blockchain events
  const mockExecutions: ExecutionLog[] = [
    {
      logId: 'exec-1',
      ruleId: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      status: 'Success',
    },
    {
      logId: 'exec-2',
      ruleId: '1', 
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
      status: 'Failed',
      errorMessage: 'Insufficient balance for swap',
    },
    {
      logId: 'exec-3',
      ruleId: '2',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      status: 'Success',
    },
  ];

  useEffect(() => {
    if (isConnected && address) {
      fetchExecutionLogs();
    } else {
      // Show mock data when not connected
      setExecutions(mockExecutions.filter(exec => showAll || exec.ruleId === ruleId));
    }
  }, [isConnected, address, ruleId, showAll]);

  const fetchExecutionLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would query blockchain for execution events
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setExecutions(mockExecutions.filter(exec => showAll || exec.ruleId === ruleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch execution logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: 'Success' | 'Failed') => {
    return status === 'Success' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Execution History {ruleId ? `(Rule ${ruleId})` : ''}
        </h3>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={fetchExecutionLogs}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {executions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-600">No executions yet</p>
          <p className="text-sm text-gray-500">Rules will appear here once they execute</p>
        </div>
      ) : (
        <div className="space-y-3">
          {executions.map((execution) => (
            <div
              key={execution.logId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    Rule {execution.ruleId}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(execution.timestamp)}
                  </span>
                </div>
                {execution.errorMessage && (
                  <p className="mt-2 text-sm text-red-600">
                    Error: {execution.errorMessage}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    // In production, this would show detailed execution info
                    alert(`Execution ${execution.logId}\nStatus: ${execution.status}\nTime: ${execution.timestamp}${execution.errorMessage ? `\nError: ${execution.errorMessage}` : ''}`);
                  }}
                >
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time indicator */}
      <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live monitoring enabled</span>
      </div>
    </Card>
  );
}

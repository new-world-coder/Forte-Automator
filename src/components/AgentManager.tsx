'use client';

import React, { useState, useEffect } from 'react';
import { useForteAgents, ForteAgent } from '@/lib/hooks/useForteAgents';
import { useFlowWallet } from '@/lib/hooks/useFlowWallet';
import { useAppNotifications } from '@/lib/contexts/NotificationContext';
import Button from './ui/Button';
import Card from './ui/Card';

export default function AgentManager() {
  const { isConnected, address } = useFlowWallet();
  const { 
    agents, 
    loading, 
    error, 
    getUserAgents, 
    updateAgentStatus, 
    removeAgent,
    getAgentHistory 
  } = useForteAgents();
  const { showSuccess, showError } = useAppNotifications();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      getUserAgents();
    }
  }, [isConnected, address, getUserAgents]);

  const handleToggleAgent = async (agentId: string, currentStatus: string) => {
    if (!isConnected) {
      showError('Agent Management', 'Please connect your wallet first');
      return;
    }

    try {
      const isActive = currentStatus === 'paused' || currentStatus === 'registered';
      await updateAgentStatus(agentId, isActive);
      showSuccess(
        'Agent Updated', 
        `Agent has been ${isActive ? 'activated' : 'paused'}`
      );
    } catch (error) {
      showError('Agent Update Failed', error instanceof Error ? error.message : 'Failed to update agent');
    }
  };

  const handleRemoveAgent = async (agentId: string, agentName: string) => {
    if (!isConnected) {
      showError('Agent Management', 'Please connect your wallet first');
      return;
    }

    if (confirm(`Are you sure you want to remove agent "${agentName}"? This will stop all automation for this rule.`)) {
      try {
        await removeAgent(agentId);
        showSuccess('Agent Removed', `Agent "${agentName}" has been removed successfully`);
      } catch (error) {
        showError('Agent Removal Failed', error instanceof Error ? error.message : 'Failed to remove agent');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'paused':
        return '⏸️';
      case 'registered':
        return '📋';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6 text-center">
        <div className="text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Wallet Required</h3>
          <p className="text-gray-600">Please connect your Flow wallet to manage automation agents.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Forte Agents</h2>
          <p className="text-gray-600">Manage your automation agents and monitor their performance</p>
        </div>
        <Button 
          onClick={() => getUserAgents()} 
          disabled={loading}
          variant="secondary"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </Card>
      )}

      {agents.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
            <p className="text-gray-600 mb-4">
              You don't have any automation agents registered yet. 
              Create a rule first, then register it as an agent to enable automatic execution.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getStatusIcon(agent.status)}</div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600">Rule ID: {agent.ruleId}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-500">Created</div>
                  <div className="font-medium">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Executions</div>
                  <div className="font-medium">{agent.executionCount}</div>
                </div>
                <div>
                  <div className="text-gray-500">Last Run</div>
                  <div className="font-medium">
                    {agent.lastExecution 
                      ? new Date(agent.lastExecution).toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Agent ID</div>
                  <div className="font-mono text-xs">{agent.id.slice(0, 8)}...</div>
                </div>
              </div>

              {agent.errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm text-red-800">
                    <strong>Last Error:</strong> {agent.errorMessage}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleAgent(agent.id, agent.status)}
                  disabled={loading}
                >
                  {agent.status === 'active' ? 'Pause' : 'Activate'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAgent(agent.id)}
                  disabled={loading}
                >
                  View History
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemoveAgent(agent.id, agent.name)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

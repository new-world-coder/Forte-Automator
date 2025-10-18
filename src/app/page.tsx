'use client';

import React, { useState, useEffect } from 'react';
import HeaderBar from '@/components/HeaderBar';
import RuleCard from '@/components/RuleCard';
import RuleEditorModal from '@/components/RuleEditorModal';
import { mockRules } from '@/lib/mockData';
import { RuleSummary, RuleDetail } from '@/lib/types';
import { useFlowWallet } from '@/lib/hooks/useFlowWallet';
import { useForteAutomation } from '@/lib/hooks/useForteAutomation';
import { useForteAgents } from '@/lib/hooks/useForteAgents';
import { useAppNotifications } from '@/lib/contexts/NotificationContext';
import Button from '@/components/ui/Button';

export default function Home() {
  const { isConnected, address } = useFlowWallet();
  const { createRule, updateRuleStatus, deleteRule, fetchUserRules, loading: automationLoading } = useForteAutomation();
  const { registerAgent } = useForteAgents();
  const { showRuleCreated, showRuleUpdated, showRuleDeleted, showRuleError, showSuccess } = useAppNotifications();
  const [rules, setRules] = useState<RuleSummary[]>(mockRules);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleDetail | undefined>();
  const [loading, setLoading] = useState(false);

  // Fetch user rules from blockchain when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchUserRulesFromBlockchain();
    }
  }, [isConnected, address]);

  const fetchUserRulesFromBlockchain = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const blockchainRules = await fetchUserRules(address);
      if (blockchainRules.length > 0) {
        setRules(blockchainRules);
      }
    } catch (error) {
      console.error('Failed to fetch rules from blockchain:', error);
      // Fallback to mock data for demo purposes
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (ruleData: Partial<RuleDetail>) => {
    if (!isConnected) {
      showRuleError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Create rule on blockchain
      const ruleId = await createRule({
        name: ruleData.name || '',
        condition: ruleData.condition || '',
        action: ruleData.action || '',
        isActive: ruleData.status === 'Active',
      });

      // Add to local state (temporary until blockchain fetch)
      const newRule: RuleSummary = {
        id: ruleId,
        name: ruleData.name || '',
        condition: ruleData.condition || '',
        status: ruleData.status || 'Active',
        lastRunAt: new Date().toISOString(),
      };
      setRules(prev => [...prev, newRule]);
      
      // Register as Forte agent if rule is active
      if (ruleData.status === 'Active') {
        try {
          await registerAgent({
            ruleId: ruleId,
            ruleName: ruleData.name || 'Untitled Rule',
            condition: ruleData.condition || '',
            action: ruleData.action || '',
            isActive: true,
          });
          showSuccess('Agent Registered', `Automation agent has been registered for "${ruleData.name}"`);
        } catch (agentError) {
          console.error('Failed to register agent:', agentError);
          // Don't fail the whole operation if agent registration fails
          showRuleCreated(ruleData.name || 'Untitled Rule');
        }
      } else {
        // Show success notification for inactive rules
        showRuleCreated(ruleData.name || 'Untitled Rule');
      }
    } catch (error) {
      console.error('Failed to create rule:', error);
      showRuleError(error instanceof Error ? error.message : 'Failed to create rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRule = (rule: RuleSummary) => {
    setEditingRule({
      ...rule,
      action: 'Mock action',
      createdAt: new Date().toISOString(),
      settings: {},
    });
  };

  const handleUpdateRule = (ruleData: Partial<RuleDetail>) => {
    if (editingRule) {
      setRules(prev => prev.map(rule => 
        rule.id === editingRule.id 
          ? { ...rule, ...ruleData }
          : rule
      ));
      setEditingRule(undefined);
    }
  };

  const handlePauseRule = async (ruleId: string) => {
    if (!isConnected) {
      showRuleError('Please connect your wallet first');
      return;
    }

    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    setLoading(true);
    try {
      const newStatus = rule.status === 'Active' ? 'Paused' : 'Active';
      await updateRuleStatus(ruleId, newStatus === 'Active');
      
      setRules(prev => prev.map(r => 
        r.id === ruleId ? { ...r, status: newStatus } : r
      ));
      
      showRuleUpdated(rule.name);
    } catch (error) {
      console.error('Failed to update rule status:', error);
      showRuleError(error instanceof Error ? error.message : 'Failed to update rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!isConnected) {
      showRuleError('Please connect your wallet first');
      return;
    }

    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    if (confirm('Are you sure you want to delete this rule?')) {
      setLoading(true);
      try {
        await deleteRule(ruleId);
        setRules(prev => prev.filter(r => r.id !== ruleId));
        showRuleDeleted(rule.name);
      } catch (error) {
        console.error('Failed to delete rule:', error);
        showRuleError(error instanceof Error ? error.message : 'Failed to delete rule. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Add debugging to see if we reach this point
  console.log('Home component rendering', { isConnected, address, rules });

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Rules</h1>
            <p className="text-gray-600 mt-1">Manage your automation rules</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            disabled={!isConnected || loading}
          >
            {loading ? 'Loading...' : isConnected ? '+ New Rule' : 'Connect Wallet First'}
          </Button>
        </div>

        {/* Rules Grid */}
        {rules.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={() => handleEditRule(rule)}
                onPause={() => handlePauseRule(rule.id)}
                onDelete={() => handleDeleteRule(rule.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules yet</h3>
            <p className="text-gray-600 mb-4">Create your first rule to get started with automation</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create your first rule
            </Button>
          </div>
        )}
      </main>

      {/* Modals */}
      <RuleEditorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateRule}
      />
      
      <RuleEditorModal
        isOpen={!!editingRule}
        onClose={() => setEditingRule(undefined)}
        onSave={handleUpdateRule}
        rule={editingRule}
      />
    </div>
  );
}

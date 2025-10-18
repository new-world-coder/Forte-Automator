'use client';

import React, { useState } from 'react';
import HeaderBar from '@/components/HeaderBar';
import RuleCard from '@/components/RuleCard';
import RuleEditorModal from '@/components/RuleEditorModal';
import { mockRules } from '@/lib/mockData';
import { RuleSummary, RuleDetail } from '@/lib/types';
import Button from '@/components/ui/Button';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [rules, setRules] = useState<RuleSummary[]>(mockRules);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleDetail | undefined>();

  const handleConnectWallet = () => {
    // Mock wallet connection
    setWalletAddress('0x742d35Cc6634C0532925a3b8D7dFCCB7c1bD2E5F');
  };

  const handleCreateRule = (ruleData: Partial<RuleDetail>) => {
    const newRule: RuleSummary = {
      id: Date.now().toString(),
      name: ruleData.name || '',
      condition: ruleData.condition || '',
      status: ruleData.status || 'Active',
      lastRunAt: new Date().toISOString(),
    };
    setRules(prev => [...prev, newRule]);
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

  const handlePauseRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'Active' ? 'Paused' : 'Active' }
        : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar 
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Rules</h1>
            <p className="text-gray-600 mt-1">Manage your automation rules</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + New Rule
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

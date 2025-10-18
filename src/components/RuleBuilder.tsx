'use client';

import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { usePriceOracle } from '@/lib/hooks/usePriceOracle';

export interface ConditionType {
  type: 'price' | 'balance' | 'time' | 'custom';
  operator: string;
  value: string;
  token?: string;
}

export interface ActionType {
  type: 'swap' | 'transfer' | 'stake' | 'custom';
  amount?: string;
  token?: string;
  recipient?: string;
  value?: string;
}

interface RuleBuilderProps {
  onConditionChange: (condition: ConditionType) => void;
  onActionChange: (action: ActionType) => void;
  condition?: ConditionType;
  action?: ActionType;
}

export default function RuleBuilder({ 
  onConditionChange, 
  onActionChange, 
  condition, 
  action 
}: RuleBuilderProps) {
  const [activeTab, setActiveTab] = useState<'condition' | 'action'>('condition');
  const { getTokenPrice, prices, loading: priceLoading } = usePriceOracle();
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const conditionTypes = [
    { value: 'price', label: 'Token Price' },
    { value: 'balance', label: 'Wallet Balance' },
    { value: 'time', label: 'Time-based' },
    { value: 'custom', label: 'Custom Condition' },
  ];

  const actionTypes = [
    { value: 'swap', label: 'Token Swap' },
    { value: 'transfer', label: 'Transfer Tokens' },
    { value: 'stake', label: 'Stake Tokens' },
    { value: 'custom', label: 'Custom Action' },
  ];

  const updateCondition = (field: keyof ConditionType, value: string) => {
    const updated = { ...condition, [field]: value } as ConditionType;
    onConditionChange(updated);
  };

  const updateAction = (field: keyof ActionType, value: string) => {
    const updated = { ...action, [field]: value } as ActionType;
    onActionChange(updated);
  };

  // Fetch current token price when token changes
  useEffect(() => {
    if (condition?.type === 'price' && condition.token) {
      const fetchPrice = async () => {
        try {
          const priceData = await getTokenPrice(condition.token!.toUpperCase());
          if (priceData) {
            setCurrentPrice(priceData.price);
          }
        } catch (error) {
          console.error('Failed to fetch price:', error);
        }
      };
      fetchPrice();
    }
  }, [condition?.token, condition?.type, getTokenPrice]);

  const renderConditionBuilder = () => {
    if (!condition) return null;

    switch (condition.type) {
      case 'price':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Token"
                value={condition.token || ''}
                onChange={(value) => updateCondition('token', value)}
                placeholder="ETH, USDC, etc."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition('operator', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="gt">Greater than</option>
                  <option value="lt">Less than</option>
                  <option value="gte">Greater than or equal</option>
                  <option value="lte">Less than or equal</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                label="Price (USD)"
                value={condition.value}
                onChange={(value) => updateCondition('value', value)}
                type="number"
                placeholder="2000"
              />
              {condition.token && currentPrice && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Current {condition.token} price:</span> 
                  {' '}${currentPrice.toFixed(2)}
                  {priceLoading && <span className="ml-2 text-blue-600">(updating...)</span>}
                </div>
              )}
            </div>
          </div>
        );

      case 'balance':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Token"
                value={condition.token || ''}
                onChange={(value) => updateCondition('token', value)}
                placeholder="FLOW, ETH, etc."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition('operator', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="gt">Greater than</option>
                  <option value="lt">Less than</option>
                  <option value="gte">Greater than or equal</option>
                  <option value="lte">Less than or equal</option>
                </select>
              </div>
            </div>
            <Input
              label="Amount"
              value={condition.value}
              onChange={(value) => updateCondition('value', value)}
              type="number"
              placeholder="0.1"
            />
          </div>
        );

      case 'time':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <select
                value={condition.operator}
                onChange={(e) => updateCondition('operator', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="interval">Every X minutes</option>
              </select>
            </div>
            {condition.operator === 'interval' && (
              <Input
                label="Interval (minutes)"
                value={condition.value}
                onChange={(value) => updateCondition('value', value)}
                type="number"
                placeholder="60"
              />
            )}
          </div>
        );

      case 'custom':
        return (
          <Input
            label="Custom Condition (Cadence)"
            value={condition.value}
            onChange={(value) => updateCondition('value', value)}
            placeholder="Enter Cadence condition logic"
          />
        );

      default:
        return null;
    }
  };

  const renderActionBuilder = () => {
    if (!action) return null;

    switch (action.type) {
      case 'swap':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From Token"
                value={action.token || ''}
                onChange={(value) => updateAction('token', value)}
                placeholder="ETH"
              />
              <Input
                label="To Token"
                value={action.recipient || ''}
                onChange={(value) => updateAction('recipient', value)}
                placeholder="USDC"
              />
            </div>
            <Input
              label="Amount"
              value={action.amount || ''}
              onChange={(value) => updateAction('amount', value)}
              type="number"
              placeholder="0.1"
            />
          </div>
        );

      case 'transfer':
        return (
          <div className="space-y-3">
            <Input
              label="Recipient Address"
              value={action.recipient || ''}
              onChange={(value) => updateAction('recipient', value)}
              placeholder="0x..."
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Token"
                value={action.token || ''}
                onChange={(value) => updateAction('token', value)}
                placeholder="FLOW, ETH, etc."
              />
              <Input
                label="Amount"
                value={action.amount || ''}
                onChange={(value) => updateAction('amount', value)}
                type="number"
                placeholder="1.0"
              />
            </div>
          </div>
        );

      case 'stake':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Token"
                value={action.token || ''}
                onChange={(value) => updateAction('token', value)}
                placeholder="FLOW"
              />
              <Input
                label="Amount"
                value={action.amount || ''}
                onChange={(value) => updateAction('amount', value)}
                type="number"
                placeholder="100"
              />
            </div>
          </div>
        );

      case 'custom':
        return (
          <Input
            label="Custom Action (Cadence)"
            value={action.value || ''}
            onChange={(value) => updateAction('value', value)}
            placeholder="Enter Cadence action logic"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('condition')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'condition'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Condition (IF)
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'action'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Action (THEN)
          </button>
        </nav>
      </div>

      {/* Condition Builder */}
      {activeTab === 'condition' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition Type</label>
            <div className="grid grid-cols-2 gap-2">
              {conditionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateCondition('type', type.value)}
                  className={`px-3 py-2 text-sm border rounded-md text-center ${
                    condition?.type === type.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          {condition && renderConditionBuilder()}
        </div>
      )}

      {/* Action Builder */}
      {activeTab === 'action' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <div className="grid grid-cols-2 gap-2">
              {actionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateAction('type', type.value)}
                  className={`px-3 py-2 text-sm border rounded-md text-center ${
                    action?.type === type.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          {action && renderActionBuilder()}
        </div>
      )}
    </div>
  );
}

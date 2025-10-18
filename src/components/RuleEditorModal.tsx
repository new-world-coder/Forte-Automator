'use client';

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import RuleBuilder, { ConditionType, ActionType } from './RuleBuilder';
import { RuleDetail } from '@/lib/types';

interface RuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleData: Partial<RuleDetail>) => void;
  rule?: RuleDetail;
}

export default function RuleEditorModal({ isOpen, onClose, onSave, rule }: RuleEditorModalProps) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    condition: rule?.condition || '',
    action: rule?.action || '',
    status: rule?.status || 'Active' as 'Active' | 'Paused',
  });

  const [condition, setCondition] = useState<ConditionType>({
    type: 'price',
    operator: 'lt',
    value: '',
    token: 'ETH',
  });

  const [action, setAction] = useState<ActionType>({
    type: 'swap',
    amount: '',
    token: 'ETH',
    recipient: 'USDC',
  });

  // Helper function to convert condition/action to human readable strings
  const formatCondition = (cond: ConditionType): string => {
    switch (cond.type) {
      case 'price':
        const priceOp = cond.operator === 'lt' ? 'drops below' : 'rises above';
        return `When ${cond.token} price ${priceOp} $${cond.value}`;
      case 'balance':
        const balanceOp = cond.operator === 'lt' ? 'falls below' : 'rises above';
        return `When ${cond.token} balance ${balanceOp} ${cond.value}`;
      case 'time':
        return `Every ${cond.operator}${cond.value ? ` (${cond.value} minutes)` : ''}`;
      case 'custom':
        return cond.value;
      default:
        return cond.value;
    }
  };

  const formatAction = (act: ActionType): string => {
    switch (act.type) {
      case 'swap':
        return `Swap ${act.amount} ${act.token} to ${act.recipient}`;
      case 'transfer':
        return `Transfer ${act.amount} ${act.token} to ${act.recipient}`;
      case 'stake':
        return `Stake ${act.amount} ${act.token}`;
      case 'custom':
        return act.value || 'Custom action';
      default:
        return act.value || 'Custom action';
    }
  };

  const handleSave = () => {
    // Validate form data
    if (!formData.name) {
      alert('Please enter a rule name');
      return;
    }

    // Use structured builder data if available, otherwise fallback to text inputs
    const conditionText = condition.value ? formatCondition(condition) : formData.condition;
    const actionText = action.amount || action.value ? formatAction(action) : formData.action;

    if (!conditionText || !actionText) {
      alert('Please configure both condition and action');
      return;
    }

    onSave({
      ...formData,
      condition: conditionText,
      action: actionText,
    });
    onClose();
  };

  return (
    <Modal
      title={rule ? 'Edit Rule' : 'New Rule'}
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <Input
          label="Rule Name"
          value={formData.name}
          onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Enter rule name"
        />

        {/* Enhanced Rule Builder */}
        <RuleBuilder
          onConditionChange={setCondition}
          onActionChange={setAction}
          condition={condition}
          action={action}
        />

        {/* Fallback text inputs for custom conditions/actions */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-3">
            Or enter custom condition/action manually:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Custom Condition (IF)"
              value={formData.condition}
              onChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
              placeholder="e.g., When ETH price drops below $2000"
            />
            <Input
              label="Custom Action (THEN)"
              value={formData.action}
              onChange={(value) => setFormData(prev => ({ ...prev, action: value }))}
              placeholder="e.g., Swap 0.1 ETH to USDC"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.status === 'Active'}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                status: e.target.checked ? 'Active' : 'Paused' 
              }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {rule ? 'Update' : 'Deploy'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

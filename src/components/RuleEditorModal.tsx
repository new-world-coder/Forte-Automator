'use client';

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
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

  const handleSave = () => {
    // Validate form data
    if (!formData.name || !formData.condition || !formData.action) {
      alert('Please fill in all required fields');
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <Modal
      title={rule ? 'Edit Rule' : 'New Rule'}
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
    >
      <div className="space-y-4">
        <Input
          label="Rule Name"
          value={formData.name}
          onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Enter rule name"
        />

        <Input
          label="Condition (IF)"
          value={formData.condition}
          onChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
          placeholder="e.g., When ETH price drops below $2000"
        />

        <Input
          label="Action (THEN)"
          value={formData.action}
          onChange={(value) => setFormData(prev => ({ ...prev, action: value }))}
          placeholder="e.g., Swap 0.1 ETH to USDC"
        />

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

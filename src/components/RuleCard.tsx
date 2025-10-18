import React from 'react';
import { RuleSummary } from '@/lib/types';
import Button from './ui/Button';
import Card from './ui/Card';

interface RuleCardProps {
  rule: RuleSummary;
  onEdit: () => void;
  onPause: () => void;
  onDelete: () => void;
}

export default function RuleCard({ rule, onEdit, onPause, onDelete }: RuleCardProps) {
  const statusColor = rule.status === 'Active' ? 'text-green-600' : 'text-yellow-600';
  const statusBg = rule.status === 'Active' ? 'bg-green-100' : 'bg-yellow-100';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{rule.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{rule.condition}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
              {rule.status}
            </div>
            <span>Last run: {new Date(rule.lastRunAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
        <Button 
          variant="secondary" 
          onClick={onEdit}
          className="px-3 py-1 text-sm"
        >
          Edit
        </Button>
        <Button 
          variant="secondary" 
          onClick={onPause}
          className="px-3 py-1 text-sm"
        >
          {rule.status === 'Active' ? 'Pause' : 'Resume'}
        </Button>
        <Button 
          variant="secondary" 
          onClick={onDelete}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}

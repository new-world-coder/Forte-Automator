'use client';

import React, { useState, useEffect } from 'react';
import { GasEstimate, useGasEstimation } from '@/lib/hooks/useGasEstimation';
import Button from './ui/Button';

interface GasEstimationProps {
  operation: 'create' | 'update' | 'delete';
  ruleData?: {
    name: string;
    condition: string;
    action: string;
    isActive: boolean;
  };
  ruleId?: string;
  onEstimateChange?: (estimate: GasEstimate | null) => void;
  className?: string;
}

export default function GasEstimation({ 
  operation, 
  ruleData, 
  ruleId, 
  onEstimateChange, 
  className = '' 
}: GasEstimationProps) {
  const { loading, error, estimateRuleCreation, estimateRuleUpdate, estimateRuleDeletion } = useGasEstimation();
  const [estimate, setEstimate] = useState<GasEstimate | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchEstimate = async () => {
      let newEstimate: GasEstimate | null = null;

      try {
        switch (operation) {
          case 'create':
            if (ruleData) {
              newEstimate = await estimateRuleCreation(ruleData);
            }
            break;
          case 'update':
            if (ruleId && ruleData) {
              newEstimate = await estimateRuleUpdate(ruleId, 'full');
            } else if (ruleId) {
              newEstimate = await estimateRuleUpdate(ruleId, 'status');
            }
            break;
          case 'delete':
            if (ruleId) {
              newEstimate = await estimateRuleDeletion(ruleId);
            }
            break;
        }
      } catch (err) {
        console.error('Failed to get gas estimate:', err);
      }

      setEstimate(newEstimate);
      onEstimateChange?.(newEstimate);
    };

    // Only fetch if we have required data
    if (operation === 'create' && ruleData) {
      fetchEstimate();
    } else if (operation === 'update' && ruleId) {
      fetchEstimate();
    } else if (operation === 'delete' && ruleId) {
      fetchEstimate();
    }
  }, [operation, ruleData, ruleId, estimateRuleCreation, estimateRuleUpdate, estimateRuleDeletion, onEstimateChange]);

  if (loading) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-blue-700">Estimating transaction cost...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <p className="text-sm text-red-600">Failed to estimate gas: {error}</p>
      </div>
    );
  }

  if (!estimate) {
    return null;
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Estimated Cost:</span>
            <span className="text-lg font-bold text-gray-900">
              {estimate.estimatedCost.toFixed(4)} FLOW
            </span>
            <span className="text-sm text-gray-500">
              (~${estimate.estimatedCostUSD.toFixed(2)})
            </span>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowDetails(!showDetails)}
          className="ml-2"
        >
          {showDetails ? 'Hide' : 'Details'}
        </Button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Computation Units:</span>
              <span className="ml-2 font-medium">{estimate.computationUnits}</span>
            </div>
            <div>
              <span className="text-gray-600">Storage Units:</span>
              <span className="ml-2 font-medium">
                {estimate.storageUnits >= 0 ? '+' : ''}{estimate.storageUnits}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Gas estimates are approximate and may vary based on network conditions.
          </div>
        </div>
      )}
    </div>
  );
}

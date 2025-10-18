'use client';

import { useState, useCallback } from 'react';
import * as fcl from '@onflow/fcl';

export interface GasEstimate {
  computationUnits: number;
  storageUnits: number;
  estimatedCost: number;
  estimatedCostUSD: number;
}

export const useGasEstimation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estimate gas for rule creation
  const estimateRuleCreation = useCallback(async (ruleData: {
    name: string;
    condition: string;
    action: string;
    isActive: boolean;
  }): Promise<GasEstimate | null> => {
    setLoading(true);
    setError(null);

    try {
      // In production, this would use fcl.send to estimate without executing
      // For now, we'll provide reasonable estimates based on operation complexity
      
      const baseUnits = {
        computationUnits: 150,
        storageUnits: 50,
      };

      // Adjust based on rule complexity
      const nameLength = ruleData.name.length;
      const conditionLength = ruleData.condition.length;
      const actionLength = ruleData.action.length;
      
      const totalLength = nameLength + conditionLength + actionLength;
      
      // More complex rules use more gas
      const complexityMultiplier = Math.max(1, totalLength / 100);
      
      const estimate: GasEstimate = {
        computationUnits: Math.round(baseUnits.computationUnits * complexityMultiplier),
        storageUnits: Math.round(baseUnits.storageUnits * complexityMultiplier),
        estimatedCost: 0.001 * complexityMultiplier, // Base FLOW cost
        estimatedCostUSD: 0.001 * complexityMultiplier * 1000, // Assuming FLOW = $1 for demo
      };

      return estimate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to estimate gas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Estimate gas for rule update
  const estimateRuleUpdate = useCallback(async (ruleId: string, operation: 'status' | 'full'): Promise<GasEstimate | null> => {
    setLoading(true);
    setError(null);

    try {
      const estimate: GasEstimate = {
        computationUnits: operation === 'status' ? 50 : 100,
        storageUnits: 0, // Updates don't use additional storage
        estimatedCost: operation === 'status' ? 0.0003 : 0.0006,
        estimatedCostUSD: operation === 'status' ? 0.30 : 0.60,
      };

      return estimate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to estimate gas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Estimate gas for rule deletion
  const estimateRuleDeletion = useCallback(async (ruleId: string): Promise<GasEstimate | null> => {
    setLoading(true);
    setError(null);

    try {
      const estimate: GasEstimate = {
        computationUnits: 75,
        storageUnits: -25, // Negative because we free up storage
        estimatedCost: 0.0004,
        estimatedCostUSD: 0.40,
      };

      return estimate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to estimate gas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    estimateRuleCreation,
    estimateRuleUpdate,
    estimateRuleDeletion,
  };
};

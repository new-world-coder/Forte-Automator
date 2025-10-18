'use client';

import { useState, useCallback } from 'react';
import * as fcl from '@onflow/fcl';
import { FORTE_CONTRACT_ADDRESS } from '../flow-config';
import { RuleDetail, ExecutionLog } from '../types';

export const useForteAutomation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new automation rule on-chain
  const createRule = useCallback(async (ruleData: {
    name: string;
    condition: string;
    action: string;
    isActive: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const ruleId = Date.now().toString();
      
      const transaction = await fcl.mutate({
        cadence: `
          import RuleRegistry from ${FORTE_CONTRACT_ADDRESS}
          
          transaction(
            id: String,
            name: String,
            condition: String,
            action: String,
            isActive: Bool
          ) {
            prepare(acct: AuthAccount) {
              RuleRegistry.createRule(
                id: id,
                name: name,
                condition: condition,
                action: action,
                isActive: isActive
              )
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(ruleId, t.String),
          arg(ruleData.name, t.String),
          arg(ruleData.condition, t.String),
          arg(ruleData.action, t.String),
          arg(ruleData.isActive, t.Bool),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transaction).onceSealed();
      
      // Here you would register with Forte Agents/Workflows
      // This is where the actual automation magic happens
      await registerWithForteAgent(ruleId, ruleData);
      
      return ruleId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update rule status (pause/resume)
  const updateRuleStatus = useCallback(async (ruleId: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const transaction = await fcl.mutate({
        cadence: `
          import RuleRegistry from ${FORTE_CONTRACT_ADDRESS}
          
          transaction(ruleId: String, isActive: Bool) {
            prepare(acct: AuthAccount) {
              RuleRegistry.updateRuleStatus(ruleId: ruleId, isActive: isActive)
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(ruleId, t.String),
          arg(isActive, t.Bool),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transaction).onceSealed();
      
      // Update Forte Agent status
      await updateForteAgentStatus(ruleId, isActive);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a rule
  const deleteRule = useCallback(async (ruleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const transaction = await fcl.mutate({
        cadence: `
          import RuleRegistry from ${FORTE_CONTRACT_ADDRESS}
          
          transaction(ruleId: String) {
            prepare(acct: AuthAccount) {
              RuleRegistry.deleteRule(ruleId: ruleId)
            }
          }
        `,
        args: (arg: any, t: any) => [arg(ruleId, t.String)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transaction).onceSealed();
      
      // Remove from Forte Agents
      await removeForteAgent(ruleId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's rules from blockchain
  const fetchUserRules = useCallback(async (userAddress: string): Promise<RuleDetail[]> => {
    try {
      const result = await fcl.query({
        cadence: `
          import RuleRegistry from ${FORTE_CONTRACT_ADDRESS}
          
          pub fun main(userAddress: Address): [RuleRegistry.Rule] {
            return RuleRegistry.getUserRules(userAddress: userAddress)
          }
        `,
        args: (arg: any, t: any) => [arg(userAddress, t.Address)],
      });

      // Transform blockchain data to our frontend types
      return result.map((rule: any) => ({
        id: rule.id,
        name: rule.name,
        condition: rule.condition,
        action: rule.action,
        status: rule.isActive ? 'Active' : 'Paused',
        createdAt: new Date(Number(rule.createdAt) * 1000).toISOString(),
        lastRunAt: rule.lastExecuted 
          ? new Date(Number(rule.lastExecuted) * 1000).toISOString()
          : new Date().toISOString(),
        settings: {},
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules');
      return [];
    }
  }, []);

  // Fetch execution logs for a rule
  const fetchExecutionLogs = useCallback(async (ruleId: string): Promise<ExecutionLog[]> => {
    try {
      const result = await fcl.query({
        cadence: `
          import RuleRegistry from ${FORTE_CONTRACT_ADDRESS}
          
          pub fun main(ruleId: String): [RuleRegistry.ExecutionLog] {
            return RuleRegistry.getExecutionLogs(ruleId: ruleId)
          }
        `,
        args: (arg: any, t: any) => [arg(ruleId, t.String)],
      });

      return result.map((log: any) => ({
        logId: log.logId,
        ruleId: log.ruleId,
        timestamp: new Date(Number(log.timestamp) * 1000).toISOString(),
        status: log.status as 'Success' | 'Failed',
        errorMessage: log.errorMessage,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      return [];
    }
  }, []);

  return {
    loading,
    error,
    createRule,
    updateRuleStatus,
    deleteRule,
    fetchUserRules,
    fetchExecutionLogs,
  };
};

// Mock functions for Forte integration (to be replaced with actual Forte API calls)
async function registerWithForteAgent(ruleId: string, ruleData: any) {
  // This would integrate with Forte's Agent/Workflow system
  console.log('Registering with Forte Agent:', { ruleId, ruleData });
  // Implementation would use Forte SDK to:
  // 1. Create a new Agent
  // 2. Set up condition monitoring (price feeds, time triggers, etc.)
  // 3. Configure action execution (swaps, transfers, etc.)
}

async function updateForteAgentStatus(ruleId: string, isActive: boolean) {
  // Update the corresponding Forte Agent status
  console.log('Updating Forte Agent status:', { ruleId, isActive });
}

async function removeForteAgent(ruleId: string) {
  // Remove the Forte Agent
  console.log('Removing Forte Agent:', { ruleId });
}

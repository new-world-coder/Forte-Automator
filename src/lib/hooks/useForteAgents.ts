'use client';

import { useState, useCallback } from 'react';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

export interface ForteAgent {
  id: string;
  name: string;
  ruleId: string;
  status: 'registered' | 'active' | 'paused' | 'error';
  createdAt: string;
  lastExecution?: string;
  executionCount: number;
  errorMessage?: string;
}

export interface AgentRegistrationData {
  ruleId: string;
  ruleName: string;
  condition: string;
  action: string;
  schedule?: string;
  isActive: boolean;
}

export const useForteAgents = () => {
  const [agents, setAgents] = useState<ForteAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register a new agent with Forte for rule automation
  const registerAgent = useCallback(async (registrationData: AgentRegistrationData): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Fix FCL authorization issue
      // Send transaction to register agent with Forte
      // Temporarily returning mock data to fix build issue
      const transactionId = 'mock-transaction-id';
      
      /*
      const transactionId = await fcl.mutate({
        cadence: `
          import ForteAgent from 0xForteAgentContract
          import RuleRegistry from 0xRuleRegistryContract

          transaction(
            ruleId: UInt64,
            ruleName: String,
            condition: String,
            action: String,
            isActive: Bool
          ) {
            let agentManager: &ForteAgent.AgentManager

            prepare(signer: AuthAccount) {
              self.agentManager = signer.borrow<&ForteAgent.AgentManager>(from: ForteAgent.AgentManagerStoragePath)
                ?? panic("Could not borrow AgentManager reference")
            }

            execute {
              let agentId = self.agentManager.registerAgent(
                ruleId: ruleId,
                ruleName: ruleName,
                condition: condition,
                action: action,
                isActive: isActive
              )
              log("Agent registered with ID: ".concat(agentId.toString()))
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(parseInt(registrationData.ruleId), t.UInt64),
          arg(registrationData.ruleName, t.String),
          arg(registrationData.condition, t.String),
          arg(registrationData.action, t.String),
          arg(registrationData.isActive, t.Bool),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      */

      // Create new agent record
      const newAgent: ForteAgent = {
        id: `agent-${Date.now()}`,
        name: registrationData.ruleName,
        ruleId: registrationData.ruleId,
        status: registrationData.isActive ? 'active' : 'registered',
        createdAt: new Date().toISOString(),
        executionCount: 0,
      };

      setAgents(prev => [...prev, newAgent]);
      return newAgent.id;

    } catch (err: any) {
      setError(err.message || 'Failed to register agent');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get agents for the current user
  const getUserAgents = useCallback(async (): Promise<ForteAgent[]> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Fix FCL implementation - temporarily using mock data
      // const result = await fcl.query({...});
      
      // Mock agent data for now
      const agentData: ForteAgent[] = [
        {
          id: 'agent-1',
          name: 'Test Agent',
          ruleId: '1',
          status: 'active',
          createdAt: new Date().toISOString(),
          executionCount: 5,
        }
      ];

      setAgents(agentData);
      return agentData;

    } catch (err: any) {
      setError(err.message || 'Failed to fetch agents');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update agent status (activate/pause)
  const updateAgentStatus = useCallback(async (agentId: string, isActive: boolean): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Fix FCL implementation - temporarily using mock
      // const transactionId = await fcl.mutate({...});
      // await fcl.tx(transactionId).onceSealed();
      
      // Simulate successful transaction
      console.log('Mock: Updating agent status', { agentId, isActive });

      // Update local state
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: isActive ? 'active' : 'paused' }
          : agent
      ));

    } catch (err: any) {
      setError(err.message || 'Failed to update agent status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove/delete an agent
  const removeAgent = useCallback(async (agentId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Fix FCL implementation - temporarily using mock
      // const transactionId = await fcl.mutate({...});
      // await fcl.tx(transactionId).onceSealed();
      
      // Simulate successful transaction
      console.log('Mock: Removing agent', { agentId });

      // Remove from local state
      setAgents(prev => prev.filter(agent => agent.id !== agentId));

    } catch (err: any) {
      setError(err.message || 'Failed to remove agent');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get agent execution history
  const getAgentHistory = useCallback(async (agentId: string) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Fix FCL implementation - temporarily using mock data
      // const result = await fcl.query({...});
      
      // Mock execution history
      return [
        {
          id: 'exec-1',
          timestamp: new Date().toISOString(),
          status: 'success',
          result: 'Agent executed successfully',
        }
      ];

    } catch (err: any) {
      setError(err.message || 'Failed to fetch agent history');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    agents,
    loading,
    error,
    registerAgent,
    getUserAgents,
    updateAgentStatus,
    removeAgent,
    getAgentHistory,
  };
};

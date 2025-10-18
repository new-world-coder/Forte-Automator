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
      // Send transaction to register agent with Forte
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
        proposer: fcl.currentUser.authorization,
        payer: fcl.currentUser.authorization,
        authorizations: [fcl.currentUser.authorization],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();

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
      const result = await fcl.query({
        cadence: `
          import ForteAgent from 0xForteAgentContract

          pub fun main(owner: Address): [ForteAgent.AgentInfo] {
            let agentManager = getAccount(owner).getCapability<&ForteAgent.AgentManager{ForteAgent.AgentManagerPublic}>(
              ForteAgent.AgentManagerPublicPath
            )!.borrow() ?? panic("Could not borrow AgentManager reference")

            return agentManager.getUserAgents(owner: owner)
          }
        `,
        args: (arg: any, t: any) => [
          arg(await fcl.currentUser.snapshot().then((user: any) => user.addr), t.Address)
        ],
      });

      const agentData = result.map((agent: any) => ({
        id: agent.id.toString(),
        name: agent.name,
        ruleId: agent.ruleId.toString(),
        status: agent.status,
        createdAt: new Date(parseFloat(agent.createdAt) * 1000).toISOString(),
        lastExecution: agent.lastExecution ? new Date(parseFloat(agent.lastExecution) * 1000).toISOString() : undefined,
        executionCount: parseInt(agent.executionCount.toString()),
        errorMessage: agent.errorMessage,
      }));

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
      const transactionId = await fcl.mutate({
        cadence: `
          import ForteAgent from 0xForteAgentContract

          transaction(agentId: String, isActive: Bool) {
            let agentManager: &ForteAgent.AgentManager

            prepare(signer: AuthAccount) {
              self.agentManager = signer.borrow<&ForteAgent.AgentManager>(from: ForteAgent.AgentManagerStoragePath)
                ?? panic("Could not borrow AgentManager reference")
            }

            execute {
              self.agentManager.updateAgentStatus(
                agentId: agentId,
                isActive: isActive
              )
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(agentId, t.String),
          arg(isActive, t.Bool),
        ],
        proposer: fcl.currentUser.authorization,
        payer: fcl.currentUser.authorization,
        authorizations: [fcl.currentUser.authorization],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();

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
      const transactionId = await fcl.mutate({
        cadence: `
          import ForteAgent from 0xForteAgentContract

          transaction(agentId: String) {
            let agentManager: &ForteAgent.AgentManager

            prepare(signer: AuthAccount) {
              self.agentManager = signer.borrow<&ForteAgent.AgentManager>(from: ForteAgent.AgentManagerStoragePath)
                ?? panic("Could not borrow AgentManager reference")
            }

            execute {
              self.agentManager.removeAgent(agentId: agentId)
            }
          }
        `,
        args: (arg: any, t: any) => [arg(agentId, t.String)],
        proposer: fcl.currentUser.authorization,
        payer: fcl.currentUser.authorization,
        authorizations: [fcl.currentUser.authorization],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();

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
      const result = await fcl.query({
        cadence: `
          import ForteAgent from 0xForteAgentContract

          pub fun main(agentId: String): [ForteAgent.ExecutionLog] {
            let agentManager = getAccount(Address.current()).getCapability<&ForteAgent.AgentManager{ForteAgent.AgentManagerPublic}>(
              ForteAgent.AgentManagerPublicPath
            )!.borrow() ?? panic("Could not borrow AgentManager reference")

            return agentManager.getAgentExecutionHistory(agentId: agentId)
          }
        `,
        args: (arg: any, t: any) => [arg(agentId, t.String)],
      });

      return result.map((execution: any) => ({
        id: execution.id.toString(),
        timestamp: new Date(parseFloat(execution.timestamp) * 1000).toISOString(),
        status: execution.status,
        result: execution.result,
        errorMessage: execution.errorMessage,
      }));

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

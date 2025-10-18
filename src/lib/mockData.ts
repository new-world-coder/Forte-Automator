import { RuleSummary, ExecutionLog } from './types';

export const mockRules: RuleSummary[] = [
  {
    id: '1',
    name: 'Auto Swap to Stablecoin',
    condition: 'When ETH price drops below $2000',
    status: 'Active',
    lastRunAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Daily Yield Harvest',
    condition: 'Every day at 9:00 AM UTC',
    status: 'Active',
    lastRunAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '3',
    name: 'Balance Alert',
    condition: 'When wallet balance falls below 0.1 FLOW',
    status: 'Paused',
    lastRunAt: '2024-01-14T15:45:00Z',
  },
];

export const mockExecutionLogs: ExecutionLog[] = [
  {
    logId: 'log-1',
    ruleId: '1',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'Success',
  },
  {
    logId: 'log-2',
    ruleId: '1',
    timestamp: '2024-01-15T09:15:00Z',
    status: 'Failed',
    errorMessage: 'Insufficient gas for transaction',
  },
  {
    logId: 'log-3',
    ruleId: '2',
    timestamp: '2024-01-15T09:00:00Z',
    status: 'Success',
  },
  {
    logId: 'log-4',
    ruleId: '2',
    timestamp: '2024-01-14T09:00:00Z',
    status: 'Success',
  },
  {
    logId: 'log-5',
    ruleId: '3',
    timestamp: '2024-01-14T15:45:00Z',
    status: 'Success',
  },
];

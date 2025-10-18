export type RuleSummary = {
  id: string;
  name: string;
  condition: string;
  status: 'Active' | 'Paused';
  lastRunAt: string;
};

export type RuleDetail = RuleSummary & {
  action: string;
  createdAt: string;
  settings: any;
};

export type ExecutionLog = {
  logId: string;
  ruleId: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  errorMessage?: string;
};

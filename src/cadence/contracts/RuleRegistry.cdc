// RuleRegistry.cdc - Smart contract for managing automation rules using Forte
import FungibleToken from 0x7e60df042a9c0868
import FlowToken from 0x7e60df042a9c0868

access(all) contract RuleRegistry {
    
    // Rule data structure
    access(all) struct Rule {
        access(all) let id: String
        access(all) let owner: Address
        access(all) let name: String
        access(all) let condition: String
        access(all) let action: String
        access(all) let isActive: Bool
        access(all) let createdAt: UFix64
        access(all) let lastExecuted: UFix64?
        
        init(
            id: String,
            owner: Address,
            name: String,
            condition: String,
            action: String,
            isActive: Bool
        ) {
            self.id = id
            self.owner = owner
            self.name = name
            self.condition = condition
            self.action = action
            self.isActive = isActive
            self.createdAt = getCurrentBlock().timestamp
            self.lastExecuted = nil
        }
    }

    // Execution log structure
    access(all) struct ExecutionLog {
        access(all) let logId: String
        access(all) let ruleId: String
        access(all) let timestamp: UFix64
        access(all) let status: String
        access(all) let errorMessage: String?
        
        init(logId: String, ruleId: String, status: String, errorMessage: String?) {
            self.logId = logId
            self.ruleId = ruleId
            self.timestamp = getCurrentBlock().timestamp
            self.status = status
            self.errorMessage = errorMessage
        }
    }

    // Storage for rules and logs
    access(all) var rules: {String: Rule}
    access(all) var userRules: {Address: [String]}
    access(all) var executionLogs: {String: [ExecutionLog]}

    // Events for rule management
    access(all) event RuleCreated(ruleId: String, owner: Address)
    access(all) event RuleUpdated(ruleId: String, owner: Address)
    access(all) event RuleDeleted(ruleId: String, owner: Address)
    access(all) event RuleExecuted(ruleId: String, status: String, timestamp: UFix64)

    init() {
        self.rules = {}
        self.userRules = {}
        self.executionLogs = {}
    }

    // Create a new automation rule
    access(all) fun createRule(
        id: String,
        name: String,
        condition: String,
        action: String,
        isActive: Bool
    ): Rule {
        let caller = self.account.address
        let rule = Rule(
            id: id,
            owner: caller,
            name: name,
            condition: condition,
            action: action,
            isActive: isActive
        )
        
        self.rules[id] = rule
        
        // Add to user's rule list
        if self.userRules[caller] == nil {
            self.userRules[caller] = []
        }
        self.userRules[caller]!.append(id)
        
        emit RuleCreated(ruleId: id, owner: caller)
        
        return rule
    }

    // Get a rule by ID
    access(all) fun getRule(ruleId: String): Rule? {
        return self.rules[ruleId]
    }

    // Get all rules for a user
    access(all) fun getUserRules(userAddress: Address): [Rule] {
        let ruleIds = self.userRules[userAddress] ?? []
        let userRulesList: [Rule] = []
        
        for ruleId in ruleIds {
            if let rule = self.rules[ruleId] {
                userRulesList.append(rule)
            }
        }
        
        return userRulesList
    }

    // Update rule status
    access(all) fun updateRuleStatus(ruleId: String, isActive: Bool): Bool {
        if let rule = self.rules[ruleId] {
            // Only owner can update
            if rule.owner != self.account.address {
                return false
            }
            
            let updatedRule = Rule(
                id: rule.id,
                owner: rule.owner,
                name: rule.name,
                condition: rule.condition,
                action: rule.action,
                isActive: isActive,
                createdAt: rule.createdAt,
                lastExecuted: rule.lastExecuted
            )
            
            self.rules[ruleId] = updatedRule
            emit RuleUpdated(ruleId: ruleId, owner: rule.owner)
            return true
        }
        return false
    }

    // Delete a rule
    access(all) fun deleteRule(ruleId: String): Bool {
        if let rule = self.rules[ruleId] {
            // Only owner can delete
            if rule.owner != self.account.address {
                return false
            }
            
            // Remove from user's rule list
            if let userRuleIds = self.userRules[rule.owner] {
                let updatedRuleIds: [String] = []
                for id in userRuleIds {
                    if id != ruleId {
                        updatedRuleIds.append(id)
                    }
                }
                self.userRules[rule.owner] = updatedRuleIds
            }
            
            // Remove rule and logs
            self.rules.remove(key: ruleId)
            self.executionLogs.remove(key: ruleId)
            
            emit RuleDeleted(ruleId: ruleId, owner: rule.owner)
            return true
        }
        return false
    }

    // Log rule execution (called by Forte Agent)
    access(all) fun logExecution(
        ruleId: String,
        status: String,
        errorMessage: String?
    ): Bool {
        if self.rules[ruleId] == nil {
            return false
        }
        
        let log = ExecutionLog(
            logId: "log_" + ruleId + "_" + getCurrentBlock().timestamp.toString(),
            ruleId: ruleId,
            status: status,
            errorMessage: errorMessage
        )
        
        // Add to execution logs
        if self.executionLogs[ruleId] == nil {
            self.executionLogs[ruleId] = []
        }
        self.executionLogs[ruleId]!.append(log)
        
        // Update rule's last executed time
        if let rule = self.rules[ruleId] {
            let updatedRule = Rule(
                id: rule.id,
                owner: rule.owner,
                name: rule.name,
                condition: rule.condition,
                action: rule.action,
                isActive: rule.isActive,
                createdAt: rule.createdAt,
                lastExecuted: getCurrentBlock().timestamp
            )
            self.rules[ruleId] = updatedRule
        }
        
        emit RuleExecuted(ruleId: ruleId, status: status, timestamp: getCurrentBlock().timestamp)
        return true
    }

    // Get execution logs for a rule
    access(all) fun getExecutionLogs(ruleId: String): [ExecutionLog] {
        return self.executionLogs[ruleId] ?? []
    }
}

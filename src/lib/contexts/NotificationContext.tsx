'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Convenience hook for common notification types
export const useAppNotifications = () => {
  const { addNotification } = useNotifications();

  const showSuccess = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({
      type: 'success',
      title,
      message,
      action,
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer duration for errors
      action,
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
      action,
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({
      type: 'info',
      title,
      message,
    });
  }, [addNotification]);

  // Wallet-specific notifications
  const showWalletConnected = useCallback((address: string) => {
    return showSuccess(
      'Wallet Connected',
      `Successfully connected wallet ${address.slice(0, 6)}...${address.slice(-4)}`
    );
  }, [showSuccess]);

  const showWalletDisconnected = useCallback(() => {
    return showInfo('Wallet Disconnected', 'Your wallet has been disconnected');
  }, [showInfo]);

  const showWalletError = useCallback((error: string) => {
    return showError('Wallet Error', error);
  }, [showError]);

  // Transaction-specific notifications
  const showTransactionPending = useCallback((txHash: string) => {
    return showInfo(
      'Transaction Pending',
      `Transaction ${txHash.slice(0, 10)}... is being processed`
    );
  }, [showInfo]);

  const showTransactionSuccess = useCallback((txHash: string) => {
    return showSuccess(
      'Transaction Success',
      `Transaction ${txHash.slice(0, 10)}... has been confirmed`
    );
  }, [showSuccess]);

  const showTransactionError = useCallback((error: string) => {
    return showError('Transaction Failed', error);
  }, [showError]);

  // Rule-specific notifications
  const showRuleCreated = useCallback((ruleName: string) => {
    return showSuccess('Rule Created', `Automation rule "${ruleName}" has been created successfully`);
  }, [showSuccess]);

  const showRuleUpdated = useCallback((ruleName: string) => {
    return showSuccess('Rule Updated', `Automation rule "${ruleName}" has been updated`);
  }, [showSuccess]);

  const showRuleDeleted = useCallback((ruleName: string) => {
    return showInfo('Rule Deleted', `Automation rule "${ruleName}" has been deleted`);
  }, [showInfo]);

  const showRuleError = useCallback((error: string) => {
    return showError('Rule Operation Failed', error);
  }, [showError]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showWalletConnected,
    showWalletDisconnected,
    showWalletError,
    showTransactionPending,
    showTransactionSuccess,
    showTransactionError,
    showRuleCreated,
    showRuleUpdated,
    showRuleDeleted,
    showRuleError,
  };
};

'use client';

import { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';
import '../flow-config';

export interface FlowUser {
  addr?: string;
  cid?: string;
  loggedIn?: boolean;
  expiresAt?: number;
}

export const useFlowWallet = () => {
  const [user, setUser] = useState<FlowUser>({ loggedIn: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for user changes
    fcl.currentUser.subscribe(setUser);
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      await fcl.authenticate();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setLoading(true);
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBalance = async (address?: string) => {
    if (!address && !user.addr) return null;
    
    try {
      const response = await fcl.query({
        cadence: `
          import FungibleToken from 0x7e60df042a9c0868
          import FlowToken from 0x7e60df042a9c0868
          
          pub fun main(address: Address): UFix64? {
            let account = getAccount(address)
            let vaultRef = account.getCapability(/public/flowTokenBalance)
              .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
              ?? panic("Could not borrow Balance reference to the Vault")
            return vaultRef.balance
          }
        `,
        args: (arg: any, t: any) => [arg(user.addr, t.Address)],
      });
      return response;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  };

  return {
    user,
    loading,
    connectWallet,
    disconnectWallet,
    getBalance,
    isConnected: user.loggedIn || false,
    address: user.addr,
  };
};

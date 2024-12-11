'use client';

import { useState, useEffect } from 'react';
import { client } from '../client';
import { createWalletClient, custom, type Chain } from 'viem';
import { storage } from '../storage';
import { currentSession } from '@lens-protocol/client/actions';

// Add Lens Testnet chain definition
const lensTestnet: Chain = {
  id: 37111,
  name: 'Lens Network Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'GRASS',
    symbol: 'GRASS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.lens.dev'],
    },
    public: {
      http: ['https://rpc.testnet.lens.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lens Block Explorer',
      url: 'https://block-explorer.testnet.lens.dev',
    },
  },
};

// Add these type definitions
type EIP1193EventMap = {
  connect: (connectInfo: { chainId: string }) => void;
  disconnect: (error: { code: number; message: string }) => void;
  chainChanged: (chainId: string) => void;
  accountsChanged: (accounts: string[]) => void;
}

type EIP1474Methods = {
  eth_requestAccounts: [];
  eth_accounts: [];
  eth_chainId: [];
  // Add other methods as needed
}

type EIP1193RequestFn<T> = <Method extends keyof T>(args: {
  method: Method;
  params?: T[Method];
}) => Promise<unknown>;

declare global {
  interface Window {
    ethereum?: {
      on: <Event extends keyof EIP1193EventMap>(
        event: Event,
        listener: EIP1193EventMap[Event]
      ) => void;
      removeListener: <Event extends keyof EIP1193EventMap>(
        event: Event,
        listener: EIP1193EventMap[Event]
      ) => void;
      request: EIP1193RequestFn<EIP1474Methods>;
    };
  }
}

export function LensLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await client.resumeSession();
      
      if (session.isOk()) {
        const currentSessionResult = await currentSession(session.value);
        
        if (currentSessionResult.isOk()) {
          setIsAuthenticated(true);
        } else {
          // If current session is not valid, clear storage
          await storage.removeItem('lens.credentials');
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      console.error('Failed to resume session:', err);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to continue');
      }

      // Create a wallet client
      const walletClient = createWalletClient({
        chain: lensTestnet,
        transport: custom(window.ethereum)
      });

      // Get the user's address
      const [address] = await walletClient.requestAddresses();

      // Login as onboarding user
      const authenticated = await client.login({
        onboardingUser: {
          app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
          wallet: address,
        },
        signMessage: async (message) => {
          const signature = await walletClient.signMessage({
            message,
            account: address,
          });
          return signature;
        },
      });

      if (authenticated.isErr()) {
        throw new Error(authenticated.error.message);
      }

      setIsAuthenticated(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lens Authentication</h2>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {isAuthenticated ? (
        <div>
          <div className="text-green-500 mb-4">
            Successfully authenticated!
          </div>
          {/* TODO: Add a button to logout */}
          {/*
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
          */}
        </div>
      ) : (
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Connect Wallet & Login'}
        </button>
      )}
    </div>
  );
} 
import { config } from '@onflow/fcl';

// Flow testnet configuration
if (typeof window !== 'undefined') {
  config({
    'flow.network': 'testnet',
    'accessNode.api': 'https://rest-testnet.onflow.org',
    'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
    'app.detail.title': 'Forte Automator',
    'app.detail.icon': 'https://avatars.githubusercontent.com/u/62387156?s=200&v=4',
    'service.OpenID.scopes': 'email',
  });
}

export const FORTE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FORTE_CONTRACT_ADDRESS || '0x01';
export const TESTNET_URL = 'https://rest-testnet.onflow.org';

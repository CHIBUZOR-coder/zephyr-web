import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export const network: WalletAdapterNetwork =
  (import.meta.env.VITE_SOLANA_NETWORK as WalletAdapterNetwork) ||
  WalletAdapterNetwork.Mainnet;

export const endpoint: string =
  import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(network);

export const isMockNetwork: boolean =
  endpoint.includes("devnet") ||
  endpoint.includes("testnet") ||
  endpoint.includes("localhost") ||
  endpoint.includes("127.0.0.1");

export const explorerClusterParam: string =
  network === WalletAdapterNetwork.Mainnet
    ? ""
    : `?cluster=${network}`;

export const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter({ network }),
];

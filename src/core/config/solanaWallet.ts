import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export const network = WalletAdapterNetwork.Devnet;

export const endpoint = clusterApiUrl(network);

export const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter()
];

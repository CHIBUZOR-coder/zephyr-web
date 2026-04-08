import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../core/query/queryKeys"; 
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect } from "react";

export const useWalletBalance = (address?: string) => {
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!address) return;

    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(address);
    } catch {
      return;
    }

    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        queryClient.setQueryData(queryKeys.wallet.balance(address), {
          address,
          balance: accountInfo.lamports / LAMPORTS_PER_SOL,
        });
      },
      "confirmed"
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [address, connection, queryClient]);

  return useQuery({
    queryKey: address
      ? queryKeys.wallet.balance(address)
      : ["wallet", "balance", "empty"],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");
      const publicKey = new PublicKey(address);
      const lamports = await connection.getBalance(publicKey);
      return {
        address,
        balance: lamports / LAMPORTS_PER_SOL,
      };
    },
    enabled: !!address,
  });
};

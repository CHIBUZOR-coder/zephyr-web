import { useState, useCallback } from "react";
import { useProgram } from "../../core/solana/useProgram";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { authFetch } from "../../core/query/authClient";
import { useWallet } from "@solana/wallet-adapter-react";
import type { MasterVaultBackendResponse } from "../../utils/MasterVaultBackendResponse";

export const useMasterVault = () => {
  const { program } = useProgram();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMasterVault = useCallback(async () => {
    if (!program || !publicKey) {
      throw new Error("Program or wallet not initialized");
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Derive PDAs
      const [masterVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("master_vault"), publicKey.toBuffer()],
        program.programId,
      );

      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId,
      );

      let tx: string | null = null;

      // Check if vault already exists on-chain
      const vaultAccountInfo =
        await program.provider.connection.getAccountInfo(masterVaultPda);

      if (vaultAccountInfo) {
        console.log(
          "Master vault already exists on-chain, syncing with backend...",
          masterVaultPda.toString(),
        );
      } else {
        // 2. Call Solana Program
        // Success fee: 2000 (20%), Volume fee: 50 (0.5%)
        // TP Trigger: 1000 (10%), TP Sell: 1000 (10%) - Minimum values required by program validation
        console.log(
          "Initializing master vault on-chain...",
          masterVaultPda.toString(),
        );

        tx = await (program.methods
          .initializeMasterVault(
            2000, // success_fee_percent
            50, // volume_fee_percent
            1000, // take_profit_trigger_bps (must be > 0)
            1000, // take_profit_sell_bps (must be > 0)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as any)
          .accounts({
            master: publicKey,
            masterVault: masterVaultPda,
            config: configPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log("Solana transaction successful:", tx);
      }

      // 3. Sync with Backend
      console.log("Syncing vault with backend...");
      const response: MasterVaultBackendResponse = await authFetch(
        "/api/vaults/master_vault",
        {
          method: "POST",
          body: JSON.stringify({ masterWallet: publicKey.toString() }),
        },
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to sync vault with backend",
        );
      }

      console.log("Backend sync successful");

      return { tx, vault: response?.data, address: response?.data?.vaultPda };
    } catch (err: unknown) {
      console.error("Error creating master vault:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const initializeProgramConfig = useCallback(async () => {
    if (!program || !publicKey) {
      throw new Error("Program or wallet not initialized");
    }

    setLoading(true);
    setError(null);

    try {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId,
      );

      // Check if config already exists
      const configAccountInfo =
        await program.provider.connection.getAccountInfo(configPda);
      if (configAccountInfo) {
        console.log(
          "Program config already exists on-chain:",
          configPda.toString(),
        );
        return null;
      }

      console.log(
        "Initializing program config on-chain...",
        configPda.toString(),
      );

      const tx = await (program.methods
        .initializeConfig(
          500, // platform_fee_bps (5%)
          9500, // trader_fee_bps (95%) - Sum must be 10000
          2000, // max_success_fee_bps (20%)
          100, // max_volume_fee_bps (1%)
          publicKey, // fee_wallet (set to self for now)
          publicKey, // admin (set to self for now)
          1000, // atomic_threshold
          50, // slot_grace_window (20 seconds)
          1, // protocol_version
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any)
        .accounts({
          authority: publicKey,
          config: configPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Program configuration successful:", tx);
      return tx;
    } catch (err: unknown) {
      console.error("Error initializing config:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  return { createMasterVault, initializeProgramConfig, loading, error };
};

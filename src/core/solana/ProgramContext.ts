import { createContext } from 'react';
import { Program } from '@coral-xyz/anchor';
import type { Zephyr } from '../../idl/zephyr';

export interface ProgramContextState {
  program: Program<Zephyr> | null;
}

export const ProgramContext = createContext<ProgramContextState>({
  program: null,
});

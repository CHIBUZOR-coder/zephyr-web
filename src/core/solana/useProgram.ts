import { useContext } from 'react';
import { ProgramContext } from './ProgramContext';

export const useProgram = () => useContext(ProgramContext);

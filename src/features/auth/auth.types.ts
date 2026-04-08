export type AuthLoginPayload = {
  publicKey: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
};

export type AuthUser = {
  id: string;
  walletAddress: string;
  role: "user" | "admin";
};

export type AuthSession = {
  authenticated: boolean;
  user: AuthUser | null;
};

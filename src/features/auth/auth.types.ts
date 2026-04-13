export type AuthLoginPayload = {
  publicKey: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
};

export type AuthUser = {
  id: string;
  walletAddress: string;
  role: "user" | "admin";
  avatar: string;
  displayName:string
};

export type AuthSession = {
  authenticated: boolean;
  user: AuthUser | null;
};

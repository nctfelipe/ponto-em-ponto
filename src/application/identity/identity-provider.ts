export interface Identity {
  id: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}

export interface SignUpCredentials {
  displayName: string;
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface IdentityProvider {
  signUp(credentials: SignUpCredentials): Promise<Identity>;
  signIn(credentials: SignInCredentials): Promise<Identity>;
  signInWithGoogle(): Promise<Identity>;
  signOut(): Promise<void>;
  onIdentityChanged(callback: (identity: Identity | null) => void, onError: () => void): () => void;
}

export class IdentityProviderError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'IdentityProviderError';
  }
}

export interface Identity {
  id: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}

export interface RegistrationCredentials {
  displayName: string;
  email: string;
  password: string;
}

export interface AuthenticationCredentials {
  email: string;
  password: string;
}

export interface IdentityProvider {
  register(credentials: RegistrationCredentials): Promise<Identity>;
  authenticate(credentials: AuthenticationCredentials): Promise<Identity>;
  authenticateWithGoogle(): Promise<Identity>;
  signOut(): Promise<void>;
  onIdentityChanged(callback: (identity: Identity | null) => void, onError: () => void): () => void;
}

export class IdentityProviderError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'IdentityProviderError';
  }
}

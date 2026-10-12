import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  IdentityProviderError,
  type Identity,
  type IdentityProvider,
  type AuthenticationCredentials,
  type RegistrationCredentials,
} from '@/application/identity/identity-provider';
import { getFirebaseApp } from '@/infrastructure/firebase/app';

async function toIdentity(user: User): Promise<Identity> {
  const token = await user.getIdTokenResult();

  return {
    id: user.uid,
    displayName: user.displayName?.trim() ?? '',
    email: user.email?.trim() ?? '',
    isAdmin: token.claims.admin === true,
  };
}

export class FirebaseIdentityProvider implements IdentityProvider {
  private readonly auth = getAuth(getFirebaseApp());
  private readonly googleProvider = new GoogleAuthProvider();

  async register(credentials: RegistrationCredentials) {
    try {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      );

      await updateProfile(result.user, { displayName: credentials.displayName });

      return await toIdentity(result.user);
    } catch (error: unknown) {
      throw new IdentityProviderError('Unable to create identity.', { cause: error });
    }
  }

  async authenticate(credentials: AuthenticationCredentials) {
    try {
      const result = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      );

      return await toIdentity(result.user);
    } catch (error: unknown) {
      throw new IdentityProviderError('Unable to authenticate identity.', { cause: error });
    }
  }

  async authenticateWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      return await toIdentity(result.user);
    } catch (error: unknown) {
      throw new IdentityProviderError('Unable to authenticate with Google.', { cause: error });
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
    } catch (error: unknown) {
      throw new IdentityProviderError('Unable to sign out.', { cause: error });
    }
  }

  onIdentityChanged(callback: (identity: Identity | null) => void, onError: () => void) {
    return onIdTokenChanged(
      this.auth,
      (user) => {
        if (!user) {
          callback(null);
          return;
        }

        void toIdentity(user).then(callback).catch(onError);
      },
      onError,
    );
  }
}

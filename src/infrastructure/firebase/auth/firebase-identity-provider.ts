import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
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
  type SignInCredentials,
  type SignUpCredentials,
} from '../../../application/identity/identity-provider';
import { getFirebaseApp } from '../app';

function toIdentity(user: User): Identity {
  return {
    id: user.uid,
    displayName: user.displayName?.trim() ?? '',
    email: user.email?.trim() ?? '',
  };
}

export class FirebaseIdentityProvider implements IdentityProvider {
  private readonly auth = getAuth(getFirebaseApp());
  private readonly googleProvider = new GoogleAuthProvider();

  async signUp(credentials: SignUpCredentials) {
    try {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      );

      await updateProfile(result.user, { displayName: credentials.displayName });

      return toIdentity(result.user);
    } catch (error: unknown) {
      throw new IdentityProviderError('Unable to create identity.', { cause: error });
    }
  }

  async signIn(credentials: SignInCredentials) {
    try {
      const result = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      );

      return toIdentity(result.user);
    } catch (error: unknown) {
      throw new IdentityProviderError('Unable to authenticate identity.', { cause: error });
    }
  }

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      return toIdentity(result.user);
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

  onIdentityChanged(callback: (identity: Identity | null) => void) {
    return onAuthStateChanged(this.auth, (user) => {
      callback(user ? toIdentity(user) : null);
    });
  }
}

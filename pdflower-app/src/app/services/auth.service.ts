import { Injectable, inject, NgZone } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, UserCredential, user, User, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, map, switchMap, of, from } from 'rxjs'; 

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firestore: Firestore = inject(Firestore);
  private ngZone: NgZone = inject(NgZone); 

  readonly user$: Observable<User | null>; 
  readonly isAdmin$: Observable<boolean>;

  constructor(private auth: Auth) {
    // 1. Initialize user$ first
    this.user$ = user(this.auth);

    // 2. Now initialize isAdmin$ after user$ is guaranteed to be set
    this.isAdmin$ = this.user$.pipe(
        switchMap(user => {
            if (!user || !user.email) {
                return of(false);
            }
            
            const adminsDocRef = doc(this.firestore, 'settings/admins');
            return from(getDoc(adminsDocRef)).pipe(
          map(docSnap => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const allowedEmails: string[] = data ? data['allowed_emails'] || [] : [];
              return allowedEmails.includes(user.email!); 
            } else {
              return false;
            }
          })
        );
      })
    );
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error("Sign-up error:", error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
  } 

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Password reset email sent successfully.');
    } catch (error) {
      console.error("Password reset error:", error);
      throw error; // Re-throw to handle in the component
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async isAdmin(): Promise<boolean> {
    // We explicitly run this logic inside Angular's zone to prevent the error
    return this.ngZone.run(async () => {
        const user = await new Promise<User | null>(resolve => {
            const sub = this.user$.subscribe(u => {
                resolve(u);
                sub.unsubscribe(); 
            });
        });

        if (!user || !user.email) return false;

        const adminsDocRef = doc(this.firestore, 'settings/admins');
        const docSnap = await getDoc(adminsDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const allowedEmails: string[] = data ? data['allowed_emails'] || [] : []; 
          return allowedEmails.includes(user.email!);
        }
        
        return false;
    });
  }
}

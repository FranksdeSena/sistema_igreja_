import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (user && user.role === 'admin') {
        return true;
      } else {
        // Redirecionar para dashboard se não for admin
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};

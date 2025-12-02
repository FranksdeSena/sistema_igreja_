import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';

export const sessionGuard: CanActivateFn = async (route, state) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  // Valida a sessão atual
  const isValid = await authService.validateSession();

  if (!isValid) {
    // Se inválida, força logout (que já redireciona para login)
    await authService.signOut();
    return false;
  }

  return true;
};

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { Observable } from 'rxjs';
import { map, take, filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: FirebaseAuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // Aguarda o carregamento inicial da autenticação terminar
    return this.authService.isLoading$.pipe(
      filter(isLoading => !isLoading),
      take(1),
      switchMap(() => this.authService.isAuthenticated$),
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        
        // Redirecionar para login
        return this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
      })
    );
  }
}

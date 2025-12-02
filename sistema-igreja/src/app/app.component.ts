import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: [],
})
export class AppComponent implements OnInit {
  title = 'sistema-igreja';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirecionamento removido para permitir acesso ao site público
    // O AuthGuard protege as rotas do dashboard
  }
}

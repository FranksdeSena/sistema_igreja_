import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardLayoutComponent } from '../../modules/dashboard/dashboard-layout.component';

@Component({
  selector: 'app-module-layout',
  standalone: true,
  imports: [RouterOutlet, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <router-outlet></router-outlet>
    </app-dashboard-layout>
  `,
})
export class ModuleLayoutComponent {}

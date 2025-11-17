import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardLayoutComponent } from '../dashboard/dashboard-layout.component';

@Component({
  selector: 'app-events-layout',
  standalone: true,
  imports: [RouterOutlet, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <router-outlet></router-outlet>
    </app-dashboard-layout>
  `,
})
export class EventsLayoutComponent {}

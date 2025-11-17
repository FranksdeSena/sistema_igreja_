import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { SupabaseInitService } from './app/core/services/supabase-init.service';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    // Inicializa Supabase
    const supabaseInit = appRef.injector.get(SupabaseInitService);
    try {
      supabaseInit.initialize(environment.supabase.url, environment.supabase.anonKey);
      console.log('✅ Sistema inicializado com Supabase');
    } catch (error) {
      console.warn('⚠️ Supabase não inicializado. Usando modo offline:', error);
    }
  })
  .catch((err) => console.error(err));

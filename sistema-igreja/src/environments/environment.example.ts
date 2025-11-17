// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
//
// ⚠️ IMPORTANTE: Este arquivo NÃO deve ser commitado se contiver credenciais reais.
// Use environment.example.ts como referência e copie para environment.ts com suas chaves.

export const environment = {
  production: false,
  supabase: {
    url: 'https://sua-project.supabase.co',
    anonKey: 'sua-chave-anonima-aqui',
  },
};

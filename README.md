# sistema_igreja
Sistema de igreja para cadastro de membros e outros

Sistemas consolidados mostram funcionalidades que usuais igrejas precisam: cadastro de membros(com numero do whassap), celula, eventos, gestão, palavra do pastor, estudos biblicos, financeira/dízimos/ofertas,auditoria, dashboard integradas com todas as paginas relatórios e comunicação (e-mail/WhatsApp). 3 niveis de usuarios, Admin, Pastor e secretario(a) aonde o admin tem poder total sobre o sistema e pode excluir e editar e criar outors usuarios e da permisções a usurios existentes

Autenticação (Supabase Auth) + RBAC (admin / pastor / secretaria)

Dashboard principal (Demostrar resumo: Quantidade de membros, Palavra do Pastor, Batismo(data de inicio e fim das palestras do batismo),tema da ultima pregação com seus versiculos, Mural estilo carrocel infinito para imagens, fotos, videos e aniversariantes do mes em destaque)

Dízimos / Finanças / oferrtas (lançar doações, relatórios, export CSV, lançamentos via pix)

Eventos / Agenda (criar eventos, inscrições para eventos)

Área do Pastor (sermons/sermões, esboços, agenda pastoral)

Área da Secretaria (controle de membros,Dizimo/ofertas,Batismo, agendas, eventos, documentos, comunicados)

Upload/logo da igreja (placeholder pronto para receber logo)

Comunicação (envio de e-mail / templates; integração futura com WhatsApp API)

Logs / auditoria e backups

Arquitetura técnica (resumo)

Frontend: Angular (componentes modulares, lazy loading por módulo: auth, dashboard, members, finance, events, pastor, secretaria). UI: Tailwind + componentes (conforme canmore guideline).

Backend: Supabase Sql-Editor(Postgres, Auth, Storage, Functions para rotinas).

Deploy: frontend hospedado (Firebase Hosting) e Supabase para banco.

Integrações: Gateways de pagamento (Asaas), WhatsApp Business API (futuro).

Segurança: regras RLS (Row Level Security) no Supabase para RBAC, TLS, backups automáticos.


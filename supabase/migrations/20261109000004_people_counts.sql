-- «¿Cuántas personas?» y «¿Hay personas en riesgo?» en los reportes de emergencia.
-- Solo rangos y una respuesta de tres valores: nunca nombres, edades ni datos de las personas.
-- Nulo = la persona no quiso o no supo responder (es opcional).

alter table public.emergency_reports
  add column if not exists people_count text check (people_count in ('one','few','many')),
  add column if not exists people_at_risk text check (people_at_risk in ('yes','no','unknown'));

-- DATOS FICTICIOS DE DEMO (is_demo = true). Ninguna persona ni publicación es real.
insert into public.sectors (id, name, city, center_lat, center_lng, radius_km) values
  ('lince','Lince','Lima',-12.0847,-77.0343,2),
  ('jesus-maria','Jesús María','Lima',-12.0701,-77.0509,2),
  ('san-isidro','San Isidro','Lima',-12.1005,-77.0364,2),
  ('la-victoria','La Victoria','Lima',-12.0654,-77.0156,2)
on conflict (id) do nothing;

insert into public.profiles (id, display_name, trust, recommendations) values
  ('00000000-0000-4000-8000-0000000000a1','Carlos V.','verified',12),
  ('00000000-0000-4000-8000-0000000000a2','María T.','endorsed',31),
  ('00000000-0000-4000-8000-0000000000a3','Jorge R.','verified',6),
  ('00000000-0000-4000-8000-0000000000a4','Lucía P.','verified',9),
  ('00000000-0000-4000-8000-0000000000a5','Rosa H.','new',0),
  ('00000000-0000-4000-8000-0000000000a6','Eduardo M.','endorsed',23)
on conflict (id) do nothing;

insert into public.posts (id, author_id, kind, category, title, description, sector_id, price_label, urgent, available_now, details, is_demo, created_at, expires_at) values
  ('00000000-0000-4000-8000-0000000000b1','00000000-0000-4000-8000-0000000000a1','offer','tools','Préstamo de escalera plegable','Escalera de aluminio de 2 metros. La presto por unas horas; la recoges y me la devuelves.','lince','Préstamo',false,true,'[{"label":"Duración del préstamo","value":"Unas horas"},{"label":"Estado","value":"Buen estado"}]',true,now()-interval '25 minutes',now()+interval '5 days'),
  ('00000000-0000-4000-8000-0000000000b2','00000000-0000-4000-8000-0000000000a2','offer','services','Clases de reforzamiento de matemáticas','Apoyo para primaria y secundaria inicial. Dos tardes a la semana en la biblioteca del barrio.','lince','Gratis',false,false,'[{"label":"Modalidad","value":"Presencial, en la biblioteca"},{"label":"Frecuencia","value":"Dos tardes por semana"}]',true,now()-interval '3 hours',now()+interval '10 days'),
  ('00000000-0000-4000-8000-0000000000b3','00000000-0000-4000-8000-0000000000a3','offer','products','Verduras de huerto sobrantes','Lechuga, culantro y tomates de mi huerto. Retiro en mi puerta, traer bolsa.','jesus-maria','Gratis',false,true,'[]',true,now()-interval '5 hours',now()+interval '2 days'),
  ('00000000-0000-4000-8000-0000000000b4','00000000-0000-4000-8000-0000000000a4','request','care','Busco compañía para mi mamá por las tardes','Mi mamá de 82 años estaría acompañada un par de horas mientras trabajo. Se agradece paciencia.','lince',null,false,false,'[]',true,now()-interval '1 day',now()+interval '7 days'),
  ('00000000-0000-4000-8000-0000000000b5','00000000-0000-4000-8000-0000000000a5','request','mobility','Necesito traslado a control médico','Uso silla de ruedas plegable. Necesito ir el jueves por la mañana a un centro de salud cercano.','san-isidro',null,true,false,'[]',true,now()-interval '2 hours',now()+interval '3 days'),
  ('00000000-0000-4000-8000-0000000000b6','00000000-0000-4000-8000-0000000000a6','offer','barter','Cambio libros escolares por útiles','Tengo libros de primaria en buen estado; me interesan cuadernos o colores.','la-victoria','Trueque',false,false,'[]',true,now()-interval '2 days',now()+interval '12 days')
on conflict (id) do nothing;

-- Eventos de demostración del barrio (fechas relativas a «ahora», siempre marcados como demo).
insert into public.sector_events (id, sector_id, kind, title, body, starts_at, place_label, source, is_demo) values
  ('00000000-0000-4000-8000-0000000000e1','lince','event','Feria de emprendedores del barrio','Vecinos que venden comida, ropa y artesanías. Entrada libre.', date_trunc('day', now()) + interval '2 days 16 hours','Parque de Lince','Junta vecinal (demo)', true),
  ('00000000-0000-4000-8000-0000000000e2','lince','event','Charla: qué hacer ante un sismo','Recomendaciones simples para tu familia y tu cuadra.', date_trunc('day', now()) + interval '4 days 19 hours','Local comunal','Defensa civil (demo)', true),
  ('00000000-0000-4000-8000-0000000000e3','lince','notice','Jornada de limpieza de la quebrada','Trae guantes y bolsas. Se entregan refrigerios.', date_trunc('day', now()) + interval '6 days 8 hours','Entrada de Lince','Municipalidad (demo)', true)
on conflict (id) do nothing;

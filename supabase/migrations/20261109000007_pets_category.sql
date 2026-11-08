-- Categoría «Animales y mascotas» para separar la ayuda con animales de la de objetos y favores.
alter table public.posts drop constraint posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('tools','services','products','barter','mobility','care','pets','business'));

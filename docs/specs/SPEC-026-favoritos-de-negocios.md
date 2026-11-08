# SPEC-026 — Favoritos de negocios

- **Estado:** hecha
- **Sprint:** 2 (S2-8)

## Qué y por qué
Que una persona guarde los negocios que le gustan con un toque y los encuentre después sin buscar de nuevo.

## Criterios de aceptación
1. **Dado** un negocio en la lista, el carrusel de Inicio o el mapa de tarjetas, **cuando** toco el corazón, **entonces** queda guardado y el corazón se ve lleno (y el lector de pantalla dice «Quitar de favoritos»).
2. **Dado** que no tengo cuenta, **cuando** toco el corazón por primera vez, **entonces** se pide crear mi nombre público y, al terminar, el negocio queda guardado.
3. **Dado** que tengo favoritos, **cuando** activo el chip «Favoritos · N» en Negocios, **entonces** veo solo esos negocios (respetando búsqueda y rubro).
4. **Dado** que no tengo favoritos, **cuando** activo el chip, **entonces** veo «Aún no tienes favoritos» con una pista, no una pantalla vacía.
5. **Dado** que quito un favorito, **entonces** no se pide cuenta y desaparece de la lista de favoritos.

## Alcance
- **Toca:** `posts` (`FavoriteButton`, `filterFavorites`), `business` (tarjeta y pantalla), `home/HomeCarousels`.
- **No cambia:** `useSavedStore` (mismo almacén que «Guardados» del perfil).

## Pruebas
- Automáticas: `filterFavorites` (solo guardadas, orden, vacío, ids inexistentes) en `posts/filters.test.ts`.
- Manuales: persisten al reabrir la app; corazón de 48 dp; funciona con letra grande.

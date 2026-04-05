# Checklist Front-Backend - Reva CRM

Fecha: 2026-04-05
Objetivo: cerrar integracion FE-BE minimizando logica en frontend y centralizando reglas en backend.

## Principio de trabajo

- Regla de negocio en backend, no en frontend.
- Frontend solo valida UX basica (campos vacios, formato visual) y muestra errores del backend.
- Backend define contrato estable: rutas, payloads, errores, enums y reglas.

## 1) Bloqueantes Semana 1 (must-have)

### Auth
- [x] Confirmar ruta canonica unica para auth (`/auth/*` o `/api/auth/*`).
- [x] Mantener estable `POST /auth/login` y `GET /auth/verify`.
- [x] Definir respuesta de error consistente en login/verify.

### Errores (critico)
- [x] Definir envelope unico de error para endpoints prioritarios:
  - `message` (string)
  - `errorCode` (string estable)
  - `details` (array opcional)
- [x] Unificar idioma de mensajes en endpoints prioritarios (English).

### Bookings (core negocio)
- [ ] Implementar validacion anti-overbooking en backend.
- [ ] Implementar validacion capacidad maxima por habitacion en backend.
- [ ] Definir matriz de transiciones de estado valida (`Confirmed`, `Checked-in`, `Checked-out`, `Cancelled`).
- [ ] Asegurar que `checkIn/checkOut` no permitan transiciones invalidas.

### Guests
- [x] Sustituir comportamiento `200 reused` por contrato determinista (`409 GUEST_DUPLICATE`) en endpoints prioritarios.
- [ ] Estabilizar reglas de duplicado por email/document.

## 2) Importante Semana 2

### Auth completo
- [ ] Implementar `GET /auth/me`.
- [ ] Implementar `POST /auth/refresh`.
- [ ] Implementar `POST /auth/logout`.

### Bookings
- [ ] Implementar `PUT/PATCH /api/bookings/:id`.
- [ ] Implementar `DELETE` o `POST cancel` con politica explicita.
- [ ] Implementar filtros de bookings por fecha/estado/room/guest.

### Recursos detalle
- [ ] Implementar `GET /api/rooms/:id`.
- [ ] Implementar `GET /api/guests/:id`.

## 3) Contrato y estabilidad

- [ ] Definir versionado de API (`/api/v1`).
- [ ] Publicar OpenAPI/Swagger o mantener Postman 100% sincronizado.
- [ ] Congelar contrato por sprint (sin breaking changes dentro del sprint).
- [ ] Publicar changelog de cambios de contrato.

## 4) Formatos globales (backend owner)

- [ ] Timezone oficial del sistema (propuesta backend para sprint actual: `UTC`).
- [ ] Moneda oficial (propuesta backend para sprint actual: `EUR`) y reglas de redondeo (propuesta: 2 decimales, half-up).
- [ ] Formato de fechas de entrada/salida (ISO 8601 obligatorio).
- [ ] Enums oficiales cerrados y documentados por modulo.

## 5) Seguridad y plataforma

- [ ] CORS restringido por entorno (no abierto global en produccion).
- [ ] Definir rate limiting basico por endpoint sensible.
- [ ] Confirmar expiracion JWT y estrategia de renovacion.

## 6) Criterio de listo para FE

Un modulo se considera listo para frontend si cumple todo:

- [ ] Endpoint implementado y probado.
- [ ] Request/response estable y documentado.
- [ ] Errores bajo envelope estandar.
- [ ] Reglas de negocio aplicadas en backend.
- [ ] Caso feliz + 2 casos de error validados con FE.

## 7) Mensaje rapido para enviar al backend

Equipo, para avanzar rapido y con menos deuda en frontend queremos empujar la mayor parte de la logica al backend. Priorizamos cerrar esta semana: (1) error envelope unico, (2) validaciones de negocio de bookings en servidor (anti-overbooking, capacidad, transiciones), (3) contrato determinista para duplicados de guest y (4) ruta canonica de auth. Con eso nosotros cerramos MVP FE sin parches fragiles. Si os parece, hacemos seguimiento diario corto de bloqueantes y congelamos contrato por sprint para evitar breaking changes de ultima hora.

## 8) Cadencia FE-BE (activa)

- [x] Sync diario corto FE-BE para bloqueantes.
- [x] Backend compartio DoD de errores para endpoints prioritarios (2026-04-05).
- [x] Backend confirmo y congelo contrato de booking detail para este sprint (`GET /api/bookings/:id` autenticado).
- [x] Backend confirmo `MODE: range` para staging en query params de bookings.
- [x] Backend confirmo prefijo canonico de auth: `/auth/*` (`/api/auth/*` queda legacy temporal hasta post-freeze).
- [ ] Sign-off de filtros/paginacion de bookings pendiente: contrato backend aun no congelado.
- [ ] Revalidar en staging para eliminar fallback de traduccion FE definitivamente (objetivo: 2026-04-12).
- [x] Fallback de traduccion FE desactivado por defecto y solo habilitable por flag temporal.

## 9) Frontend ya entregado

- [x] Capa API centralizada (`src/api/*`) y normalizacion de errores.
- [x] Guard global de sesion expirada por 401 con token.
- [x] Estados UX consistentes (loading/error/empty) en vistas core.
- [x] Tabla de bookings con accion `View` conectada a detalle real.
- [x] Booking detail con datos canonicos (`GET /api/bookings/:id` autenticado).
- [x] Acciones operativas en booking detail: check-in, check-out, assign guest.
- [x] Refresco automatico del detalle despues de mutaciones.
- [x] Quick actions de check-in/check-out en bookings table con guardas por estado.
- [x] Feedback por fila con auto-limpieza en operaciones de bookings table y room history.
- [x] Estados de carga por fila para evitar bloqueos globales en acciones operativas.
- [x] Flujo de booking detail con acciones operativas unificadas y mensajes consistentes.
- [x] Tabla de bookings preparada para filtros/paginacion server-side con fallback cliente.
- [x] Proteccion contra respuestas obsoletas en bookings table (abort + stale guard).
- [x] Capa de compatibilidad de query params para bookings (`date`/`from`/`to`) con switch por entorno.
- [x] Diagnostico dev del modo de query bookings visible en runtime.
- [x] Guia FE-BE de debug para query mode de bookings publicada (`docs/BOOKINGS-QUERY-MODE-DEBUG.md`).
- [x] Limite configurable de paginas en `listAllBookings` para evitar carga excesiva (`VITE_MAX_ALL_BOOKINGS_PAGES`).
- [x] Vista de bookings por propiedad usa fetch paginated-safe (evita lista vacia con respuesta paginada).
- [x] Auth base URL configurable por entorno (`VITE_AUTH_URL`) para cambiar `/auth` vs `/api/auth` sin tocar codigo.

## 10) Siguiente bloque FE (pendiente)

- [ ] Remover fallback de traduccion FE tras validacion de staging (objetivo: 2026-04-12) usando `docs/STAGING-VALIDATION-RUNBOOK.md`.
- [x] Confirmar con backend el modo final de query params (`date` vs `from/to`) y fijar `VITE_BOOKINGS_QUERY_MODE`.
- [ ] Ejecutar validacion conjunta en staging y marcar cada checkpoint como `Pass`, `Pending contract` o `Blocked by missing endpoint` en `docs/STAGING-VALIDATION-RUNBOOK.md`.

## 11) Billing readiness (futuro)

- [x] Documento de preparacion creado: `docs/BILLING-READINESS-NOTE.md`.
- [ ] Congelar contrato backend de currency/rounding y snapshot de pricing.
- [ ] Definir enum y transiciones de estado de pago.

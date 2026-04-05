# Checklist Front-Backend - Reva CRM

Fecha: 2026-04-05
Objetivo: cerrar integracion FE-BE minimizando logica en frontend y centralizando reglas en backend.

## Principio de trabajo

- Regla de negocio en backend, no en frontend.
- Frontend solo valida UX basica (campos vacios, formato visual) y muestra errores del backend.
- Backend define contrato estable: rutas, payloads, errores, enums y reglas.

## 1) Bloqueantes Semana 1 (must-have)

### Auth
- [ ] Confirmar ruta canonica unica para auth (`/auth/*` o `/api/auth/*`).
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

- [ ] Timezone oficial del sistema (ej: `Europe/Madrid` o `UTC`).
- [ ] Moneda oficial (ej: `EUR`) y reglas de redondeo.
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
- [ ] Revalidar en staging y remover fallback de traduccion FE (objetivo: 2026-04-12).

## 9) Frontend ya entregado

- [x] Capa API centralizada (`src/api/*`) y normalizacion de errores.
- [x] Guard global de sesion expirada por 401 con token.
- [x] Estados UX consistentes (loading/error/empty) en vistas core.
- [x] Tabla de bookings con accion `View` conectada a detalle real.
- [x] Booking detail con datos canonicos (`GET /api/bookings/:id` autenticado).
- [x] Acciones operativas en booking detail: check-in, check-out, assign guest.
- [x] Refresco automatico del detalle despues de mutaciones.
- [x] Quick actions de check-in/check-out en bookings table con guardas por estado.

## 10) Siguiente bloque FE (sin bloqueo)

- [ ] Robustecer feedback en quick actions (success/error por fila en tabla).
- [ ] Homogeneizar estilos de botones operativos en bookings y room history.
- [ ] Remover fallback de traduccion FE tras validacion de staging (2026-04-12).

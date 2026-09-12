# Plan: Migrar PlantWallet a tu proyecto Supabase personal

## Objetivo
Reemplazar el backend gestionado por Lovable Cloud con un proyecto Supabase personal tuyo, conservando el esquema, las reglas de seguridad y —si es posible— los datos existentes, sin reescribir la lógica de la app.

## Situación actual
- Backend activo: Lovable Cloud / Supabase (`project_id: lqouurerfgltxsxtqqyp`).
- Estado del proyecto Lovable: pausado (el pooler no responde en este momento).
- Esquema y lógica de base de datos: están en `supabase/migrations/` en tres archivos SQL ordenados por fecha.
- Cliente Supabase del frontend: auto-generado (`src/integrations/supabase/client.ts`), lee las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Autentación con Google usa el broker de Lovable (`lovable.auth.signInWithOAuth`). Al cambiar de backend probablemente haya que usar el flujo nativo de Supabase.

## Decisiones pendientes a confirmar
1. ¿Quieres conservar los datos de usuario actuales o aceptas empezar desde cero en el nuevo proyecto?
2. ¿Puedes reactivar / despausar el proyecto Lovable actual para exportar, o prefieres recrear todo desde las migraciones?

## Plan de trabajo

```text
[Paso 1] Crear proyecto personal en Supabase
    |
[Paso 2] Elegir y ejecutar migración de datos
    |-- Opción A: pg_dump desde Lovable (requiere proyecto activo + contraseña de BD)
    |-- Opción B: aplicar migraciones existentes y arrancar desde cero
    |
[Paso 3] Configurar Auth en el nuevo proyecto
    |-- Email / password (posiblemente con confirmación automática)
    |-- Google OAuth con tus propias credenciales
    |
[Paso 4] Actualizar variables de entorno / .env
    |
[Paso 5] Ajustar el login con Google si el broker de Lovable deja de funcionar
    |
[Paso 6] Validar funcionalmente
```

### 1. Crear proyecto personal en Supabase
- Entra a tu dashboard de Supabase y crea un nuevo proyecto.
- Guarda:
  - Project URL (p. ej. `https://<ref>.supabase.co`)
  - Publishable / anon key
  - Service role key (secreto; guárdala solo en variables de entorno)
  - Contraseña de la base de datos y connection string del pooler.

### 2. Migrar esquema y datos

#### Opción A: conservar datos actuales
- Asegúrate de que el proyecto Lovable esté activo (no pausado).
- Conéctate con el Supabase CLI o `pg_dump` usando el connection string del pooler y la contraseña de la base de datos.
- Realiza un dump del esquema + datos y restáuralo en el proyecto personal.
- Verifica que las funciones, triggers y RLS se copiaron correctamente.

#### Opción B: recrear desde cero (recomendado si no puedes obtener la contraseña ni despausar)
- Abre el SQL Editor del nuevo proyecto Supabase.
- Ejecuta los archivos de `supabase/migrations/` en orden cronológico:
  1. `20260907200244_0a41430d-e6e8-442a-a120-33c60beac4bc.sql`
  2. `20260907200301_1fac411f-fde9-4d7d-8e6a-f2ac89bdeeed.sql`
  3. `20260912054209_e84e6c93-c2e8-4e6d-815a-46a1d3445ef6.sql`
- Esto crea tablas, políticas RLS, funciones y triggers exactamente como están ahora.
- Los datos de usuario no se migran; cada usuario deberá registrarse de nuevo.

### 3. Configurar Auth
- En **Authentication > Providers** del nuevo proyecto:
  - Habilita **Email**.
  - Habilita **Google** y añade tu `Client ID` y `Client Secret`.
  - Añade la URL de redirección permitida: `https://<tu-dominio-de-lovable>/auth` y `http://localhost:8080/auth` para desarrollo.
- Si quieres evitar confirmación por correo en desarrollo, puedes desactivarla en Authentication > Settings (solo en el proyecto personal, nunca en producción pública).

### 4. Actualizar variables de conexión
- **No edites** `src/integrations/supabase/client.ts` ni `src/integrations/supabase/client.server.ts` (son archivos auto-generados).
- Cambia las variables de entorno para que apunten al nuevo proyecto:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_PROJECT_ID`
  - `SUPABASE_SERVICE_ROLE_KEY` (secreto de servidor)
- Para local, edita `.env`. Para preview/publicación, configúralas en el panel de variables de entorno de Lovable.

### 5. Ajustar el inicio de sesión con Google
- El código actual usa `lovable.auth.signInWithOAuth("google", ...)`. Si al cambiar de backend este broker deja de funcionar, cambia la llamada en `src/routes/auth.tsx` a:
  ```ts
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth` },
  });
  ```
- Esto es el único cambio de código que podría ser necesario.

### 6. Validación
- Levanta la app en local (`bun dev`).
- Crea una cuenta nueva, confirma el correo si es necesario.
- Registra ingresos, gastos, categorías y presupuestos.
- Revisa que:
  - `/inicio` muestra la planta, salud y balance.
  - `/movimientos`, `/reportes`, `/retos` y `/ajustes` cargan datos del nuevo backend.
  - La función `recalc_challenges` ejecuta sin errores al guardar un movimiento.
- Ejecuta `bunx tsgo --noEmit` y revisa `build-errors.log`.

## Notas importantes
- Lovable Cloud gestiona el backend actual; si lo desconectas, perderás la capacidad de que Lovable lo administre (backups, escalado, etc.). El nuevo proyecto es tuyo y lo gestionas directamente en Supabase.
- Si eliges la opción B (inicio desde cero), considera avisar a los usuarios actuales para que vuelvan a crear sus cuentas.
- No commitees la `SUPABASE_SERVICE_ROLE_KEY` en el repositorio.

## Resultado esperado
PlantWallet apunta a tu propio proyecto Supabase, conserva toda la estructura de base de datos y las reglas de seguridad, y funciona en local y en preview con tus propias credenciales.

# FERREMAS Constructor

Proyecto ecommerce FERREMAS generado originalmente desde Lovable y luego adaptado para operar con:

- frontend `React + Vite + TypeScript`
- backend `Express`
- pagos reales con `Transbank Webpay Plus`
- persistencia local con `SQLite`
- panel interno conectado a compras reales

## Estado actual

La app ya no funciona como demo aislada en `localStorage`.

Ahora incluye:

- registro e inicio de sesion real contra backend
- sesiones para clientes y administrador
- compras guardadas en base de datos SQLite
- checkout con `Webpay Plus`
- pedidos por transferencia bancaria
- panel admin que consume pedidos reales
- perfil del usuario conectado a datos persistentes

## Arquitectura

### Frontend

- `src/pages/Auth.tsx`: login y registro de clientes
- `src/pages/Cart.tsx`: checkout con Transbank o transferencia
- `src/pages/CheckoutResult.tsx`: retorno y confirmacion del pago
- `src/pages/Profile.tsx`: perfil persistente y compras reales
- `src/pages/Panel.tsx`: panel administrativo con pedidos reales
- `src/context/AuthContext.tsx`: estado de sesion del cliente
- `src/context/CartContext.tsx`: carrito persistente en navegador

### Backend

- `server/index.js`: API REST principal
- `server/transbank.js`: configuracion de Webpay Plus
- `server/db.js`: base SQLite, tablas y operaciones
- `server/security.js`: hash y verificacion de contraseñas

## Base de datos

La app usa `SQLite` local, sin instalar un motor aparte.

Archivo generado:

```text
server/data/ferremas.sqlite
```

Tablas principales:

- `users`
- `sessions`
- `orders`
- `order_items`

## Requisitos

- `Node.js 22+`
- `npm`

`Node 22` es importante porque este proyecto usa `node:sqlite`, que viene integrado en Node moderno.

## Instalacion

```bash
npm install
```

## Como correrlo rapido

Si solo quieres probar la app en local, no necesitas crear `.env`.

Ejecuta:

```bash
npm run dev:all
```

Esto levanta:

- frontend en `http://localhost:8080`
- backend en `http://localhost:3001`

## Identidad visual

La pestaña del navegador y la marca superior usan:

```text
public/LOGO.ico
```

Si quieres cambiar el logo del proyecto, reemplaza ese archivo por otro `.ico` con el mismo nombre.

## Variables de entorno

El proyecto funciona sin `.env` porque trae valores de desarrollo por defecto.

Si quieres personalizar puertos, credenciales admin o produccion, crea un archivo `.env` en la raiz con este contenido:

```env
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3001
PORT=3001
TRANSBANK_ENV=integration
TRANSBANK_COMMERCE_CODE=
TRANSBANK_API_KEY=
ADMIN_USER=admin
ADMIN_PASS=ferremas2026
```

## Scripts disponibles

```bash
npm run dev
npm run dev:server
npm run dev:all
npm run build
npm run preview
npm run server
npm run test
npm run lint
npm run db:reset
```

## Flujo cliente

### Registro e inicio de sesion

1. Abre `http://localhost:8080`
2. Entra a `Ingresar`
3. Crea una cuenta o inicia sesion

Los datos del usuario quedan guardados en SQLite.

### Compra por Webpay Plus

1. Agrega productos al carrito
2. Entra a `/carrito`
3. Elige retiro o despacho
4. Si eliges retiro, selecciona la sucursal
5. Elige `Webpay Plus (Transbank)`
6. Presiona `Pagar con Transbank`
7. Completa el flujo de Webpay
8. Al volver, la app confirma el pago y guarda la orden en la base de datos

### Compra por transferencia

1. Agrega productos
2. Entra al carrito
3. Elige `Transferencia bancaria`
4. Confirma el pedido
5. La orden se crea con pago pendiente
6. Luego puede ser validada desde el panel admin

## Datos de prueba de Transbank

Para `TRANSBANK_ENV=integration` puedes usar:

- tarjeta: `4051885600446623`
- CVV: `123`
- fecha: cualquier fecha futura
- RUT banco: `11.111.111-1`
- clave banco: `123`

Referencias:

- https://transbankdevelopers.cl/documentacion/webpay-plus
- https://www.npmjs.com/package/transbank-sdk

## Acceso administrador

Ruta:

```text
http://localhost:8080/admin
```

Credenciales por defecto:

- usuario: `admin`
- contraseña: `ferremas2026`

Estas credenciales pueden cambiarse con:

- `ADMIN_USER`
- `ADMIN_PASS`

## Que muestra el panel interno

El panel ahora lee pedidos reales desde la base de datos:

- pedidos pendientes
- pagos por confirmar
- pedidos aprobados
- pedidos en preparacion
- pedidos listos o despachados
- resumen de ventas
- pedidos por sucursal

Tambien permite:

- aprobar o rechazar pedidos
- confirmar pagos de transferencia
- pasar pedidos a preparacion
- marcar pedidos listos
- despachar pedidos

## Endpoints principales

### Cliente

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/signout`
- `POST /api/orders/transfer`
- `POST /api/payments/webpay/create`
- `POST /api/payments/webpay/commit`

### Admin

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`

### Salud

- `GET /api/health`

## Preparacion para despliegue

La app ya esta mas cerca de produccion, pero todavia hay consideraciones:

### Lo que ya esta listo

- backend separado del frontend
- pagos reales con Transbank
- usuarios persistentes
- ordenes persistentes
- panel admin funcional
- credenciales admin configurables

### Lo que debes revisar antes de subirla

- cambiar `TRANSBANK_ENV=production`
- configurar `TRANSBANK_COMMERCE_CODE`
- configurar `TRANSBANK_API_KEY`
- cambiar `FRONTEND_URL` al dominio real
- cambiar `BACKEND_URL` a la URL publica real
- cambiar `ADMIN_USER` y `ADMIN_PASS`
- proteger HTTPS obligatoriamente

### Recomendacion de despliegue

Opciones practicas:

- `Railway` para backend + disco persistente
- `Render` para backend
- `Vercel` para frontend
- `VPS` si quieres control total

### Nota importante sobre SQLite

Para desarrollo local, `SQLite` es excelente porque es simple y rapido.

Para produccion:

- sirve si despliegas en una sola maquina o VPS persistente
- no es ideal si usas plataformas serverless efimeras
- si escalas mas, conviene migrar a `PostgreSQL`

## Reset de base de datos local

Si quieres partir desde cero:

1. Deten la app
2. Ejecuta:

```bash
npm run db:reset
```

3. Vuelve a levantar:

```bash
npm run dev:all
```

## Subir el proyecto a GitHub

### Antes de subirlo

Este proyecto ya ignora correctamente:

- `node_modules/`
- `dist/`
- `.env`
- `server/data/`
- archivos SQLite temporales

Eso evita subir dependencias, builds o tu base local de pruebas.

### Flujo recomendado

1. Crea un repositorio vacio en GitHub.
2. En la carpeta del proyecto inicializa Git si aun no existe:

```bash
git init
git branch -M main
```

3. Agrega y confirma los archivos:

```bash
git add .
git commit -m "feat: ferremas ecommerce con backend y transbank"
```

4. Conecta el remoto:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
```

5. Sube el proyecto:

```bash
git push -u origin main
```

### Si GitHub te pide autenticacion

GitHub normalmente no acepta contraseña simple por HTTPS.

Usa una de estas opciones:

- GitHub Desktop
- Git Credential Manager
- token personal de GitHub
- clave SSH

## Probarlo en otro computador

### Opcion 1: ejecutar el proyecto en otro PC

En el otro computador necesitas:

- `Node.js 22+`
- `npm`
- copiar o clonar este proyecto

Luego:

```bash
npm install
npm run dev:all
```

### Opcion 2: abrirlo desde otro PC en la misma red

Si tu computador anfitrion esta ejecutando el proyecto, otro equipo en la misma red puede abrirlo usando la IP local que muestra Vite, por ejemplo:

```text
http://192.168.x.x:8080
```

Nota:

- el backend tambien debe quedar accesible
- ambos equipos deben estar en la misma red

### Opcion 3: abrirlo desde otra red

Si quieres probarlo desde otra casa, otro internet o datos moviles, necesitas:

- desplegarlo en internet
- o abrir un tunel temporal como `ngrok` o `cloudflared`

Sin eso, `localhost` no funciona fuera de tu computador.

## Verificaciones realizadas

Se comprobo:

- `npm install`
- `npm run build`
- `npm run test`
- `npm run lint`
- backend operativo con `GET /api/health`
- registro de usuario por API
- creacion de pedido por API
- lectura de pedidos desde panel admin por API
- actualizacion de estado de pedido por API
- checkout Webpay Plus funcionando localmente

## Estado del lint

`npm run lint` no tiene errores.

Quedan advertencias del scaffold de `react-refresh` en algunos componentes UI compartidos, pero no bloquean compilacion ni funcionamiento.

## Resumen de mejoras aplicadas

### Respecto al proyecto original de Lovable

- se elimino la dependencia principal de `localStorage` para usuarios y compras
- se agrego backend real con rutas y sesiones
- se agrego base de datos SQLite
- se conecto Transbank al flujo de compra
- se conecto el panel interno a pedidos reales
- se mejoro UX en login, checkout, resultado de pago y perfil

## Siguiente evolucion recomendada

Si quieres dejarla aun mas profesional, el siguiente paso natural es:

1. migrar catalogo e inventario tambien a base de datos
2. agregar stock real descontable por compra
3. agregar roles admin separados por permisos
4. agregar recuperacion de contraseña
5. migrar de SQLite a PostgreSQL para produccion escalable

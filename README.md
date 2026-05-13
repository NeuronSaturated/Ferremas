# FERREMAS Ecommerce

Aplicacion web para FERREMAS, una tienda de ferreteria y construccion, desarrollada como ecommerce completo con catalogo, carrito, pagos, panel interno, chatbot y sucursales con mapa interactivo.

El proyecto nacio desde una base React/Lovable y fue evolucionado a una arquitectura con frontend, backend, persistencia real y despliegue en servicios cloud.

## Demo

- Frontend: https://ferremas-ecru.vercel.app
- Backend: https://ferremas-backend-nh5z.onrender.com
- Salud API: https://ferremas-backend-nh5z.onrender.com/api/health

> Nota: el backend esta en Render Free, por lo que puede tardar algunos segundos en responder si estuvo inactivo.

## Caracteristicas

- Catalogo de productos con busqueda, filtros por categoria y detalle de producto.
- Carrito de compras con control de sesion.
- Registro, inicio de sesion, edicion de perfil y cambio/recuperacion de contrasena.
- Compra con Webpay Plus usando Transbank en ambiente de integracion.
- Compra por transferencia bancaria con validacion manual.
- Stock real descontable al confirmar compras.
- Historial de compras por usuario.
- Panel interno protegido para administradores/personal autorizado.
- Gestion de pedidos con estados claros, filtros y detalle administrativo.
- Chatbot FERREMAS conectado al backend en `/api/chat`.
- Catalogo e inventario persistidos en base de datos.
- Sucursales con pagina de detalle y mapa interactivo de Google Maps.
- Imagenes de catalogo servidas localmente para mejorar carga y consistencia visual.

## Stack

- Frontend: React 18, Vite, TypeScript, React Router, Tailwind CSS, shadcn/ui.
- Backend: Node.js 22, Express 5.
- Base de datos: PostgreSQL cuando existe `DATABASE_URL`; SQLite como fallback local.
- Pagos: Transbank SDK / Webpay Plus.
- Testing: Vitest.
- Deploy: Vercel para frontend, Render para backend, Supabase PostgreSQL para produccion.

## Estructura

```text
src/                 Frontend React
src/pages/           Vistas principales
src/components/      Componentes reutilizables
src/context/         Auth y carrito
src/lib/             Cliente API y utilidades
server/              Backend Express
server/db.js         Selector de adaptador PostgreSQL/SQLite
server/db-postgres.js
server/db-sqlite.js
server/transbank.js
shared/              Datos compartidos, seed de productos
public/catalog/      Imagenes locales del catalogo
```

## Requisitos

- Node.js 22 o superior
- npm

Node 22 es importante porque el fallback local usa `node:sqlite`.

## Instalacion

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raiz si necesitas personalizar el entorno. Para desarrollo local se puede partir desde `.env.example`.

```env
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3001
PORT=3001
ALLOWED_ORIGINS=http://localhost:8080

# Produccion usa PostgreSQL/Supabase. Si queda vacio, usa SQLite local.
DATABASE_URL=

# Fallback SQLite local
DATA_DIR=server/data
SQLITE_PATH=

# Transbank
TRANSBANK_ENV=integration
TRANSBANK_COMMERCE_CODE=
TRANSBANK_API_KEY=

# Panel interno
ADMIN_USER=
ADMIN_PASS=
```

No subas `.env` al repositorio. Las credenciales reales se configuran directamente en Vercel, Render y Supabase.

## Ejecutar en local

Levantar frontend y backend juntos:

```bash
npm run dev:all
```

Servicios locales:

- Frontend: http://localhost:8080
- Backend: http://localhost:3001

Tambien puedes correrlos por separado:

```bash
npm run dev
npm run dev:server
```

## Scripts

```bash
npm run dev          # frontend Vite
npm run dev:server   # backend Express con watch
npm run dev:all      # frontend + backend
npm run build        # build produccion
npm run preview      # preview del build
npm run start        # backend
npm run test         # tests
npm run lint         # lint
npm run db:reset     # reset SQLite local
```

## Base de datos

El backend elige adaptador automaticamente:

- Si existe `DATABASE_URL`, usa PostgreSQL.
- Si `DATABASE_URL` esta vacio, usa SQLite local en `server/data/ferremas.sqlite`.

En produccion se recomienda PostgreSQL, por ejemplo Supabase. SQLite queda pensado para desarrollo local o pruebas simples.

## Flujo de compra

1. El cliente inicia sesion o crea una cuenta.
2. Agrega productos al carrito.
3. Selecciona retiro en sucursal o despacho.
4. Paga con Webpay Plus o crea pedido por transferencia.
5. El backend registra la orden y descuenta stock cuando corresponde.
6. El cliente puede revisar su historial en el perfil.
7. El panel interno permite revisar y actualizar estados de pedidos.

## Webpay Plus

En ambiente de integracion (`TRANSBANK_ENV=integration`) se pueden usar las tarjetas de prueba oficiales de Transbank.

Flujo:

- `POST /api/payments/webpay/create` crea la transaccion.
- Transbank redirige al formulario de pago.
- `POST /api/payments/webpay/commit` confirma el resultado.
- La aplicacion muestra `/checkout/resultado`.

Para produccion debes configurar:

- `TRANSBANK_ENV=production`
- `TRANSBANK_COMMERCE_CODE`
- `TRANSBANK_API_KEY`
- `FRONTEND_URL`
- `BACKEND_URL`

## Panel interno

El panel esta protegido por sesion administrativa. El acceso publico del cliente no muestra el enlace al panel.

Rutas principales:

- `/admin`: login interno.
- `/panel`: dashboard y gestion de pedidos.

Configura `ADMIN_USER` y `ADMIN_PASS` como variables de entorno del backend. No dejes credenciales reales dentro del codigo ni del README.

## Chatbot

El asistente FERREMAS usa el endpoint:

```text
POST /api/chat
```

Puede responder sobre:

- busqueda de productos
- disponibilidad y precio
- pagos
- retiro en tienda
- despacho
- estado general de compras

## Sucursales

La pagina `/sucursales` muestra el listado de tiendas. Cada sucursal redirige a una pagina propia, por ejemplo:

```text
/sucursales/maipu
/sucursales/providencia
/sucursales/concepcion
```

El detalle incluye foto, direccion, horario, encargado, servicios y mapa interactivo de Google Maps.

## API principal

Cliente:

- `GET /api/products`
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/auth/me`
- `POST /api/auth/signout`
- `PATCH /api/auth/profile`
- `PATCH /api/auth/password`
- `POST /api/auth/recover`
- `POST /api/orders/transfer`
- `POST /api/payments/webpay/create`
- `POST /api/payments/webpay/commit`
- `POST /api/chat`

Admin:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`

Salud:

- `GET /api/health`

## Despliegue

### Vercel

Frontend React/Vite.

Variables necesarias:

```env
VITE_API_URL=https://ferremas-backend-nh5z.onrender.com
```

El archivo `vercel.json` permite que las rutas SPA como `/sucursales/maipu` o `/checkout/resultado` funcionen al recargar la pagina.

### Render

Backend Express.

Variables recomendadas:

```env
FRONTEND_URL=https://ferremas-ecru.vercel.app
BACKEND_URL=https://ferremas-backend-nh5z.onrender.com
ALLOWED_ORIGINS=https://ferremas-ecru.vercel.app
DATABASE_URL=postgresql://...
TRANSBANK_ENV=integration
TRANSBANK_COMMERCE_CODE=
TRANSBANK_API_KEY=
ADMIN_USER=
ADMIN_PASS=
```

Comandos:

```bash
npm install
npm start
```

### Supabase

Supabase provee PostgreSQL. Copia la connection string del proyecto y pegala como `DATABASE_URL` en Render.

El backend crea y sincroniza las tablas/semillas necesarias al iniciar.

## Verificacion

Antes de entregar o desplegar cambios:

```bash
npm run build
npm run test
npm run lint
```

Estado conocido:

- `build`: OK
- `test`: OK
- `lint`: sin errores. Pueden existir advertencias heredadas de Fast Refresh en componentes UI compartidos.

## Notas de seguridad

- No subir `.env`.
- No publicar claves de Transbank ni credenciales admin.
- Mantener `ADMIN_USER` y `ADMIN_PASS` solo en variables de entorno.
- En produccion usar HTTPS y dominios reales en `FRONTEND_URL`, `BACKEND_URL` y `ALLOWED_ORIGINS`.
- Para una version comercial real, revisar reglas de negocio, logs, recuperacion de contrasena con email real y monitoreo.

## Autor

Proyecto academico FERREMAS desarrollado y desplegado como ecommerce fullstack con integracion de pagos, base de datos y panel administrativo.

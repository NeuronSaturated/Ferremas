# FERREMAS Ecommerce

Ecommerce fullstack para FERREMAS, con catalogo de productos, carrito, pagos Webpay Plus, historial de compras, panel interno, chatbot y sucursales con mapa interactivo.

## Demo

- Frontend: https://ferremas-ecru.vercel.app
- Backend: https://ferremas-backend-nh5z.onrender.com
- Healthcheck: https://ferremas-backend-nh5z.onrender.com/api/health

> El backend esta en Render Free, por lo que puede tardar algunos segundos en despertar.

## Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Node.js 22 + Express
- PostgreSQL/Supabase en produccion
- SQLite como fallback local
- Transbank Webpay Plus
- Vitest
- Deploy en Vercel + Render

## Funcionalidades

- Catalogo con busqueda, filtros y detalle de producto.
- Carrito protegido por sesion.
- Registro, login, perfil y cambio/recuperacion de contrasena.
- Pagos con Webpay Plus y pedidos por transferencia.
- Stock persistente y descontable.
- Historial de compras del cliente.
- Panel interno protegido para gestion de pedidos.
- Chatbot FERREMAS mediante `/api/chat`.
- Sucursales con pagina de detalle y Google Maps.

## Instalacion local

Requisitos:

- Node.js 22+
- npm

```bash
npm install
npm run dev:all
```

URLs locales:

- Frontend: http://localhost:8080
- Backend: http://localhost:3001

## Variables de entorno

Puedes partir desde `.env.example`. Lo esencial:

```env
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3001
PORT=3001
ALLOWED_ORIGINS=http://localhost:8080

DATABASE_URL=

TRANSBANK_ENV=integration
TRANSBANK_COMMERCE_CODE=
TRANSBANK_API_KEY=

ADMIN_USER=
ADMIN_PASS=
```

Si `DATABASE_URL` esta vacio, el backend usa SQLite local. En produccion se usa PostgreSQL/Supabase.

## Scripts

```bash
npm run dev          # frontend
npm run dev:server   # backend
npm run dev:all      # frontend + backend
npm run build        # build produccion
npm run test         # pruebas
npm run lint         # lint
npm run db:reset     # reset SQLite local
```

## Despliegue

### Vercel

Configurar en el frontend:

```env
VITE_API_URL=https://ferremas-backend-nh5z.onrender.com
```

### Render

Configurar en el backend:

```env
FRONTEND_URL=https://ferremas-ecru.vercel.app
BACKEND_URL=https://ferremas-backend-nh5z.onrender.com
ALLOWED_ORIGINS=https://ferremas-ecru.vercel.app
DATABASE_URL=postgresql://...
TRANSBANK_ENV=integration
ADMIN_USER=
ADMIN_PASS=
```

Comando de inicio:

```bash
npm start
```

### Supabase

Copiar la connection string de PostgreSQL y usarla como `DATABASE_URL` en Render.

## Rutas principales

- `/catalogo`: catalogo.
- `/producto/:id`: detalle de producto.
- `/carrito`: checkout.
- `/perfil`: datos e historial del cliente.
- `/sucursales`: listado de sucursales.
- `/sucursales/:slug`: detalle con mapa.
- `/admin`: login interno.
- `/panel`: gestion administrativa.

## Verificacion

Antes de entregar cambios:

```bash
npm run build
npm run test
npm run lint
```

Estado actual: build y tests OK. Lint sin errores, solo advertencias heredadas de Fast Refresh en componentes compartidos.

## Seguridad

- No subir `.env`.
- No publicar claves de Transbank.
- No dejar credenciales admin en codigo ni README.
- Configurar `ADMIN_USER` y `ADMIN_PASS` solo como variables de entorno.

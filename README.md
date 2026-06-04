# FERREMAS

Ecommerce fullstack para FERREMAS desarrollado para Integracion de Plataformas. Incluye catalogo, carrito, usuarios, historial de compras, panel interno, Webpay Plus, conversion de moneda con Banco Central, chatbot y sucursales con mapa.

## Demo

- Frontend: https://ferremas-ecru.vercel.app
- Backend: https://ferremas-backend-nh5z.onrender.com
- Healthcheck: https://ferremas-backend-nh5z.onrender.com/api/health

> Render Free puede tardar algunos segundos en despertar el backend.

## Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Node.js 22 + Express
- PostgreSQL/Supabase en produccion
- SQLite como fallback local
- Transbank Webpay Plus
- Banco Central de Chile API BDE
- Traduccion ES/EN/PT con LibreTranslate y fallback gratuito
- Vitest
- Deploy en Vercel + Render

## Funcionalidades

- Catalogo con busqueda, filtros, stock y detalle de producto.
- Registro, login, perfil, cambio y recuperacion simulada de contrasena.
- Carrito y checkout con retiro en tienda o despacho.
- Pago con Webpay Plus y pedido por transferencia bancaria.
- Conversion referencial USD/BRL/GBP a CLP mediante Banco Central.
- Traduccion de interfaz y textos dinamicos.
- Chatbot mediante `/api/chat`.
- Historial de compras para clientes.
- Panel interno protegido para administracion de pedidos.
- Sucursales con pagina de detalle y Google Maps.

## Instalacion local

Requisitos: Node.js 22+ y npm.

```bash
npm install
npm run dev:all
```

URLs locales:

- Frontend: http://localhost:8080
- Backend: http://localhost:3001

## Variables de entorno

Usar `.env.example` como base. Variables principales:

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

BCCH_USER=
BCCH_PASS=

LIBRETRANSLATE_URL=https://libretranslate.com
LIBRETRANSLATE_API_KEY=

ADMIN_USER=
ADMIN_PASS=
```

Si `DATABASE_URL` esta vacio, se usa SQLite local. En produccion se usa PostgreSQL/Supabase.

## Scripts

```bash
npm run dev          # frontend
npm run dev:server   # backend
npm run dev:all      # frontend + backend
npm run build        # build de produccion
npm run test         # pruebas
npm run lint         # lint
npm run db:reset     # reinicia SQLite local
```

## Despliegue

Vercel necesita:

```env
VITE_API_URL=https://ferremas-backend-nh5z.onrender.com
```

Render necesita:

```env
FRONTEND_URL=https://ferremas-ecru.vercel.app
BACKEND_URL=https://ferremas-backend-nh5z.onrender.com
ALLOWED_ORIGINS=https://ferremas-ecru.vercel.app
DATABASE_URL=postgresql://...
TRANSBANK_ENV=integration
BCCH_USER=
BCCH_PASS=
LIBRETRANSLATE_URL=https://libretranslate.com
LIBRETRANSLATE_API_KEY=
ADMIN_USER=
ADMIN_PASS=
```

Comando de inicio en Render:

```bash
npm start
```

## Rutas principales

- `/catalogo`: catalogo.
- `/producto/:id`: detalle de producto.
- `/carrito`: checkout.
- `/perfil`: datos e historial del cliente.
- `/sucursales`: listado de sucursales.
- `/sucursales/:slug`: detalle con mapa.
- `/admin`: acceso interno.
- `/panel`: gestion administrativa.

## Verificacion

```bash
npm run build
npm run test
npm run lint
```

El lint puede mostrar advertencias heredadas de Fast Refresh, pero no errores.

## Seguridad

- No subir `.env`.
- No publicar claves de Transbank, Banco Central ni servicios externos.
- Configurar `ADMIN_USER` y `ADMIN_PASS` solo como variables de entorno.

<a id="readme-top"></a>

<div align="center">
  <h1>FERREMAS</h1>
  <p>
    Ecommerce fullstack para una ferreteria online, desarrollado como proyecto de Integracion de Plataformas.
  </p>
</div>

## Tabla de contenidos

- [Sobre el proyecto](#sobre-el-proyecto)
- [Construido con](#construido-con)
- [Funcionalidades](#funcionalidades)
- [Primeros pasos](#primeros-pasos)
- [Rutas principales](#rutas-principales)
- [API principal](#api-principal)
- [Pruebas en Postman](#pruebas-en-postman)
- [Verificacion](#verificacion)
- [Seguridad](#seguridad)

## Sobre el proyecto

FERREMAS simula una tienda online de productos de ferreteria y construccion. La aplicacion permite navegar el catalogo, revisar productos, agregar al carrito, comprar, pagar con Webpay Plus, consultar conversion de moneda con Banco Central, revisar sucursales y administrar pedidos desde un panel interno protegido.

El proyecto integra frontend, backend, base de datos y servicios externos para representar un flujo completo de compra y gestion.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Construido con

Estas son las tecnologias principales utilizadas en el proyecto:

- [![React][React.js]][React-url]
- [![Vite][Vite.js]][Vite-url]
- [![TypeScript][TypeScript.js]][TypeScript-url]
- [![Tailwind CSS][Tailwind.css]][Tailwind-url]
- [![Node.js][Node.js]][Node-url]
- [![Express][Express.js]][Express-url]
- [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
- [![Supabase][Supabase]][Supabase-url]
- [![Vercel][Vercel]][Vercel-url]
- [![Render][Render]][Render-url]
- [![Transbank][Transbank]][Transbank-url]
- [![Vitest][Vitest]][Vitest-url]

Tambien se utiliza SQLite como respaldo local, la API BDE del Banco Central de Chile para conversion de moneda y servicios de traduccion como LibreTranslate/MyMemory.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Funcionalidades

- Catalogo de productos con busqueda, filtros por categoria, stock disponible y detalle individual.
- Carrito de compras con seleccion de cantidad, retiro en tienda o despacho a domicilio.
- Registro, inicio de sesion, perfil de usuario, seguridad e historial de compras.
- Pago mediante Webpay Plus de Transbank.
- Pedido por transferencia bancaria con validacion manual.
- Conversion referencial de moneda extranjera a pesos chilenos mediante Banco Central.
- Selector de idioma para espanol, ingles y portugues.
- Chatbot conectado al backend para responder sobre productos, stock, pagos, retiro y despacho.
- Panel interno protegido para revisar pedidos y actualizar estados.
- Pagina de sucursales con detalle, contacto y mapa interactivo.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Primeros pasos

Esta seccion resume como preparar el proyecto para revision o desarrollo.

### Requisitos

- Node.js 22 o superior
- npm

### Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar frontend y backend:

```bash
npm run dev:all
```

Si no existe una conexion PostgreSQL configurada, el backend utiliza SQLite como respaldo local para facilitar las pruebas.

### Scripts disponibles

```bash
npm run dev          # inicia el frontend
npm run dev:server   # inicia el backend
npm run dev:all      # inicia frontend y backend
npm run build        # genera build de produccion
npm run test         # ejecuta pruebas automatizadas
npm run lint         # revisa el codigo
npm run db:reset     # reinicia la base SQLite local
```

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Rutas principales

- `/`: pagina de inicio.
- `/catalogo`: listado de productos.
- `/producto/:id`: detalle de producto.
- `/auth`: registro, inicio de sesion y recuperacion simulada de contrasena.
- `/carrito`: carrito y proceso de compra.
- `/checkout/resultado`: resultado de pago Webpay.
- `/perfil`: datos del cliente e historial de compras.
- `/sucursales`: listado de sucursales.
- `/sucursales/:slug`: detalle de sucursal con mapa.
- `/admin`: acceso interno.
- `/panel`: administracion de pedidos.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## API principal

- `GET /api/health`: verifica el estado del backend.
- `GET /api/products`: lista productos con precio, stock y fecha.
- `POST /api/auth/signup`: registra un cliente.
- `POST /api/auth/signin`: inicia sesion.
- `GET /api/auth/me`: obtiene el usuario autenticado.
- `POST /api/auth/signout`: cierra la sesion del cliente.
- `PATCH /api/auth/profile`: actualiza datos del perfil.
- `PATCH /api/auth/password`: cambia la contrasena.
- `POST /api/auth/recover`: simula recuperacion de contrasena.
- `POST /api/orders/transfer`: crea un pedido por transferencia.
- `POST /api/payments/webpay/create`: inicia un pago Webpay Plus.
- `POST /api/payments/webpay/commit`: confirma una transaccion Webpay.
- `GET /api/exchange/rate`: consulta tasa de cambio.
- `GET /api/exchange/convert`: convierte moneda extranjera a CLP.
- `POST /api/chat`: responde consultas del asistente virtual.
- `POST /api/translate`: traduce textos de la interfaz.
- `POST /api/admin/login`: inicia sesion administrativa.
- `POST /api/admin/logout`: cierra la sesion administrativa.
- `GET /api/admin/orders`: lista pedidos para el panel interno.
- `PATCH /api/admin/orders/:id`: actualiza el estado de un pedido.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Pruebas en Postman

Ejemplo para consultar el catalogo:

```http
GET /api/products
```

Ejemplo de respuesta:

```json
{
  "products": [
    {
      "id": "p1",
      "sku": "FM-001",
      "name": "Taladro Percutor Inalambrico 18V",
      "brand": "Bosch",
      "category": "Herramientas",
      "price": 89990,
      "stock": 23,
      "imageKey": "product-drill.jpg",
      "description": "Taladro percutor profesional...",
      "date": "04-06-2026 15:29"
    }
  ]
}
```

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Verificacion

Antes de entregar o publicar cambios se recomienda ejecutar:

```bash
npm run build
npm run test
npm run lint
```

El lint puede mostrar advertencias heredadas de Fast Refresh, pero no errores criticos.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Seguridad

- No subir archivos `.env`.
- No publicar credenciales de Transbank, Banco Central, Supabase ni servicios externos.
- Mantener las credenciales administrativas solo como variables privadas del servidor.
- Usar tokens de sesion para proteger rutas de clientes y administradores.
- Validar los datos recibidos antes de crear pedidos o iniciar pagos.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E
[Vite-url]: https://vite.dev/
[TypeScript.js]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Supabase]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Vercel]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[Vercel-url]: https://vercel.com/
[Render]: https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=000000
[Render-url]: https://render.com/
[Transbank]: https://img.shields.io/badge/Transbank-Webpay_Plus-E30613?style=for-the-badge
[Transbank-url]: https://www.transbankdevelopers.cl/
[Vitest]: https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white
[Vitest-url]: https://vitest.dev/

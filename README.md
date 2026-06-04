# FERREMAS

FERREMAS es un ecommerce fullstack desarrollado para la evaluacion de Integracion de Plataformas. La aplicacion simula una ferreteria online con catalogo, carrito de compras, usuarios, pagos, conversion de moneda, panel interno, chatbot y sucursales con mapa.

## Construido con

Este proyecto utiliza las siguientes tecnologias principales:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Node.js
- Express
- PostgreSQL / Supabase
- SQLite
- Transbank Webpay Plus
- API BDE del Banco Central de Chile
- LibreTranslate / MyMemory
- Vitest

## Funcionalidades

- Catalogo de productos con busqueda, filtros por categoria, stock disponible y detalle individual.
- Carrito de compras con seleccion de cantidad, retiro en tienda o despacho a domicilio.
- Registro e inicio de sesion para clientes.
- Perfil de usuario con datos personales, seguridad e historial de compras.
- Pago mediante Webpay Plus de Transbank.
- Opcion de pedido por transferencia bancaria con validacion manual.
- Conversion referencial de moneda extranjera a pesos chilenos usando la API del Banco Central de Chile.
- Selector de idioma para espanol, ingles y portugues.
- Chatbot conectado al backend para consultas sobre productos, stock, pagos, retiro y despacho.
- Panel interno protegido para administracion y revision de pedidos.
- Pagina de sucursales con detalle, informacion de contacto y mapa interactivo.

## Primeros pasos

Esta seccion indica como preparar una copia del proyecto para revision o desarrollo.

### Requisitos

- Node.js 22 o superior
- npm

### Instalacion

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar frontend y backend:

```bash
npm run dev:all
```

Si no existe una conexion PostgreSQL configurada, el backend utiliza SQLite como respaldo local para facilitar las pruebas.

## Scripts disponibles

```bash
npm run dev          # inicia el frontend
npm run dev:server   # inicia el backend
npm run dev:all      # inicia frontend y backend
npm run build        # genera build de produccion
npm run test         # ejecuta pruebas automatizadas
npm run lint         # revisa el codigo
npm run db:reset     # reinicia la base SQLite local
```

## Rutas principales

- `/`: pagina de inicio.
- `/catalogo`: listado de productos.
- `/producto/:id`: detalle de producto.
- `/carrito`: carrito y proceso de compra.
- `/perfil`: datos del cliente e historial de compras.
- `/sucursales`: listado de sucursales.
- `/sucursales/:slug`: detalle de sucursal con mapa.
- `/admin`: acceso interno.
- `/panel`: administracion de pedidos.

## API principal

- `GET /api/health`: verifica el estado del backend.
- `GET /api/products`: lista productos con precio, stock y fecha.
- `POST /api/auth/signup`: registra un cliente.
- `POST /api/auth/signin`: inicia sesion.
- `GET /api/auth/me`: obtiene el usuario autenticado.
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
- `GET /api/admin/orders`: lista pedidos para el panel interno.
- `PATCH /api/admin/orders/:id`: actualiza el estado de un pedido.

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

## Verificacion

Antes de entregar o publicar cambios se recomienda ejecutar:

```bash
npm run build
npm run test
npm run lint
```

El lint puede mostrar advertencias heredadas de Fast Refresh, pero no errores criticos.

## Seguridad

- No subir archivos `.env`.
- No publicar credenciales de Transbank, Banco Central, Supabase ni servicios externos.
- Mantener las credenciales administrativas solo como variables privadas del servidor.
- Usar tokens de sesion para proteger rutas de clientes y administradores.
- Validar los datos recibidos antes de crear pedidos o iniciar pagos.

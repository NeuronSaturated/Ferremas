# FERREMAS

Ecommerce fullstack desarrollado para la evaluacion de Integracion de Plataformas. El proyecto simula una tienda FERREMAS con catalogo, carrito, usuarios, compras, panel interno, Webpay Plus, conversion de moneda con Banco Central de Chile, chatbot y sucursales con mapa.

## Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Node.js + Express
- PostgreSQL/Supabase y SQLite como respaldo local
- Transbank Webpay Plus
- API BDE del Banco Central de Chile
- LibreTranslate/MyMemory para traduccion
- Vitest

## Funcionalidades

- Catalogo con busqueda, filtros, stock y detalle de producto.
- Registro, inicio de sesion, perfil, seguridad e historial de compras.
- Carrito con retiro en tienda o despacho a domicilio.
- Pago mediante Webpay Plus o transferencia bancaria.
- Conversion referencial de moneda extranjera a CLP usando Banco Central.
- Selector de idioma para espanol, ingles y portugues.
- Chatbot conectado al backend mediante `/api/chat`.
- Panel interno protegido para revisar pedidos y estados.
- Sucursales con pagina de detalle y mapa interactivo.

## Ejecucion

Requisitos: Node.js 22+ y npm.

```bash
npm install
npm run dev:all
```

Si no existe conexion PostgreSQL configurada, el backend usa SQLite para facilitar pruebas locales.

## Scripts

```bash
npm run dev          # frontend
npm run dev:server   # backend
npm run dev:all      # frontend + backend
npm run build        # build de produccion
npm run test         # pruebas automatizadas
npm run lint         # revision de codigo
npm run db:reset     # reinicia SQLite local
```

## Rutas Web

- `/`: inicio.
- `/catalogo`: listado de productos.
- `/producto/:id`: detalle de producto.
- `/carrito`: carrito y checkout.
- `/perfil`: datos del cliente e historial de compras.
- `/sucursales`: listado de tiendas.
- `/sucursales/:slug`: detalle de sucursal con mapa.
- `/admin`: acceso interno.
- `/panel`: administracion de pedidos.

## API Principal

- `GET /api/health`: verifica estado del backend.
- `GET /api/products`: lista productos con precio, stock y fecha.
- `POST /api/auth/register`: registra clientes.
- `POST /api/auth/login`: inicia sesion.
- `GET /api/me`: obtiene datos del usuario autenticado.
- `PUT /api/me`: actualiza datos del perfil.
- `POST /api/orders/transfer`: crea pedido por transferencia.
- `POST /api/webpay/create`: inicia pago Webpay Plus.
- `POST /api/webpay/commit`: confirma retorno de Transbank.
- `GET /api/exchange/rate`: consulta tasa del Banco Central.
- `GET /api/exchange/convert`: convierte moneda extranjera a CLP.
- `POST /api/chat`: responde consultas del asistente virtual.
- `POST /api/translate`: traduce textos de la interfaz.

## Pruebas en Postman

Ejemplo para catalogo:

```http
GET /api/products
```

Respuesta esperada:

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

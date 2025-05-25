
# Sistema de Préstamo de Equipos de Laboratorio

Este proyecto es una plataforma web completa para la gestión de préstamos y devoluciones de equipos de laboratorio, control de inventario, historial, usuarios y notificaciones. Incluye backend (Node.js/Express/MongoDB) y frontend (Next.js/React/TypeScript).


## Estructura del Proyecto

```
proyecto_final/
├── backend/           # API REST Node.js/Express/MongoDB
│   ├── config/        # Configuración de la base de datos
│   ├── controllers/   # Lógica de negocio (préstamos, equipos, usuarios...)
│   ├── middleware/    # Autenticación, manejo de errores, roles, uploads
│   ├── models/        # Modelos de Mongoose
│   ├── routes/        # Endpoints de la API
│   ├── utils/         # Utilidades (PDF, validadores, helpers)
│   ├── app.js, server.js
│   └── ...
├── client/            # Frontend Next.js/React/TypeScript
│   ├── src/app/       # Páginas principales (loans, inventory, login, profile...)
│   ├── src/components/# Componentes reutilizables (tablas, modales, formularios...)
│   ├── src/services/  # Servicios para consumir la API
│   ├── src/hooks/     # Hooks personalizados
│   ├── src/styles/    # Estilos globales
│   └── ...
├── MANUAL_TECNICO.md  # Manual técnico actualizado
├── MANUAL_USUARIO.md  # Manual de usuario actualizado
└── README.md
```


## Instalación y Puesta en Marcha

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd proyecto_final
   ```

2. Backend:
   ```bash
   cd backend
   npm install --legacy-peer-deps
   # Configura tu .env según .env.example
   npm run dev
   # El backend corre en http://localhost:5000
   ```

3. Frontend:
   ```bash
   cd ../client
   npm install --legacy-peer-deps
   npm run dev
   # El frontend corre en http://localhost:3030
   ```


## Tecnologías Utilizadas

- Node.js, Express, MongoDB, Mongoose
- Next.js, React, TypeScript, TailwindCSS
- JWT (autenticación)
- Validaciones, middlewares personalizados
- Generación de PDF y exportación a Excel


## Scripts Útiles

- `npm run dev` (en backend y client): Inicia ambos servidores en modo desarrollo
- `npm run build` y `npm start` (en client): Para producción


## Funcionalidades Destacadas

- Registro y gestión de préstamos de equipos (con cantidades y fechas)
- Devolución parcial o total de equipos, con nota adicional
- Ajuste automático del inventario según devoluciones
- Historial detallado de préstamos y devoluciones
- Gestión de inventario: agregar, editar, eliminar equipos
- Exportación de datos a Excel
- Cambio de contraseña y cambio de tema (claro/oscuro)
- Autenticación y roles de usuario

## Manuales
- [Manual Técnico](./client/public/MANUAL_TECNICO.md)
- [Manual de Usuario](./client/public/MANUAL_USUARIO.md)
## Autores

- Julian Granda Tamayo
- Brahian Steven Salazar Isaza
- Juan David Obando Álvarez
- Juan Alejandro Giraldo Marin

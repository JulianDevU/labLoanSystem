
# Sistema de Préstamo de Equipos de Laboratorio

Este proyecto es una plataforma web completa para la gestión de préstamos y devoluciones de equipos de laboratorio, control de inventario, historial, usuarios y notificaciones. Incluye backend (Node.js/Express/MongoDB) y frontend (Next.js/React/TypeScript).


## Estructura del Proyecto

```
proyecto_final/
├── backend/                         # API REST Node.js/Express/MongoDB
│   ├── app.js                       # Configuración principal de la app Express
│   ├── server.js                    # Punto de entrada del servidor
│   ├── package.json                 # Dependencias y scripts del backend
│   ├── config/                      # Configuración de la base de datos y variables
│   │   └── db.js                    # Conexión a MongoDB
│   ├── controllers/                 # Lógica de negocio (préstamos, equipos, usuarios...)
│   │   ├── authController.js        # Controlador de autenticación
│   │   ├── equipmentController.js   # Controlador de equipos
│   │   ├── laboratoryController.js  # Controlador de laboratorios
│   │   ├── loanController.js        # Controlador de préstamos
│   │   ├── notificationController.js# Controlador de notificaciones
│   │   └── userController.js        # Controlador de usuarios
│   ├── middleware/                  # Middlewares personalizados
│   │   ├── auth.js                  # Middleware de autenticación JWT
│   │   ├── error.js                 # Manejo centralizado de errores
│   │   ├── roleCheck.js             # Control de roles de usuario
│   │   └── upload.js                # Manejo de archivos
│   ├── models/                      # Modelos de datos (Mongoose)
│   │   ├── Equipment.js             # Modelo de equipo
│   │   ├── Laboratory.js            # Modelo de laboratorio
│   │   ├── Loan.js                  # Modelo de préstamo
│   │   ├── Notification.js          # Modelo de notificación
│   │   └── User.js                  # Modelo de usuario
│   ├── routes/                      # Endpoints de la API
│   │   ├── auth.js                  # Rutas de autenticación
│   │   ├── equipment.js             # Rutas de equipos
│   │   ├── laboratory.js            # Rutas de laboratorios
│   │   ├── loan.js                  # Rutas de préstamos
│   │   ├── notification.js          # Rutas de notificaciones
│   │   └── user.js                  # Rutas de usuarios
│   └── utils/                       # Utilidades generales
│       ├── generateLabs.js          # Generación de laboratorios de ejemplo
│       ├── generatePDF.js           # Generación de reportes PDF
│       ├── helpers.js               # Funciones auxiliares
│       └── validators.js            # Validadores personalizados
├── client/                          # Frontend Next.js/React/TypeScript
│   ├── package.json                 # Dependencias y scripts del frontend
│   ├── next.config.js               # Configuración de Next.js
│   ├── tailwind.config.ts           # Configuración de TailwindCSS
│   ├── tsconfig.json                # Configuración de TypeScript
│   ├── public/                      # Archivos públicos y recursos
│   │   ├── MANUAL_TECNICO.md        # Manual técnico
│   │   ├── MANUAL_TECNICO.pdf       # Manual técnico (PDF)
│   │   ├── MANUAL_USUARIO.md        # Manual de usuario
│   │   ├── MANUAL_USUARIO.pdf       # Manual de usuario (PDF)
│   │   ├── placeholder-logo.png     # Recursos gráficos
│   │   ├── placeholder-logo.svg
│   │   ├── placeholder-user.jpg
│   │   ├── placeholder.jpg
│   │   ├── placeholder.svg
│   │   └── prestamo.png
│   └── src/                         # Código fuente del frontend
│       ├── app/                     # Páginas principales y rutas
│       │   ├── [locale]/            # Soporte multilenguaje
│       │   │   ├── globals.css      # Estilos globales
│       │   │   ├── layout.tsx       # Layout principal
│       │   │   ├── page.tsx         # Página principal
│       │   │   ├── dashboard/       # Dashboard de usuario
│       │   │   ├── import/          # Importación de datos
│       │   │   ├── inventory/       # Inventario de equipos
│       │   │   └── loans/           # Préstamos
│       │   └── api/                 # Endpoints API internos (Next.js)
│       ├── components/              # Componentes reutilizables
│       │   ├── dashboard-header.tsx # Header del dashboard
│       │   ├── dashboard-nav.tsx    # Navegación del dashboard
│       │   ├── dashboard-shell.tsx  # Contenedor principal
│       │   ├── equipment-selector.tsx
│       │   ├── file-upload.tsx
│       │   ├── home-client.tsx
│       │   ├── icons.tsx
│       │   ├── image-upload.tsx
│       │   ├── inventory-summary.tsx
│       │   ├── inventory-table.tsx
│       │   ├── lab-feature-card.tsx
│       │   ├── lab-selector.tsx
│       │   ├── loan-history-table.tsx
│       │   ├── loan-table.tsx
│       │   ├── locale-provider.tsx
│       │   ├── mobile-sidebar.tsx
│       │   ├── modal.tsx
│       │   ├── overview-stats.tsx
│       │   ├── theme-provider.tsx
│       │   ├── theme-toggle.tsx
│       │   ├── user-nav.tsx
│       │   ├── ui/                  # Componentes UI genéricos
│       │   └── utils/               # Utilidades de componentes
│       ├── hooks/                   # Hooks personalizados
│       │   ├── use-mobile.tsx
│       │   ├── use-toast.ts
│       │   ├── useAuth.ts
│       │   ├── useLocalePersistence.tsx
│       │   └── useRequireAuth.ts
│       ├── i18n/                    # Internacionalización
│       │   ├── navigation.ts
│       │   ├── request.ts
│       │   └── routing.ts
│       ├── lib/                     # Librerías y utilidades
│       │   └── utils.ts
│       ├── messages/                # Archivos de traducción para la app
│       │   ├── de.json              # Alemán
│       │   ├── en.json              # Inglés
│       │   ├── es.json              # Español
│       │   ├── fr.json              # Francés
│       │   └── po.json              # Plantilla de traducción
│       ├── services/                # Servicios para consumir la API
│       │   ├── authService.ts
│       │   ├── equipmentService.ts
│       │   ├── exportExcelService.ts
│       │   ├── importExcelService.ts
│       │   ├── laboratoryService.ts
│       │   ├── loanService.ts
│       │   ├── loginService.ts
│       │   └── userService.ts
│       └── styles/                  # Estilos globales
│           └── globals.css
├── docs/                            # Documentación adicional
│   ├── MANUAL_TECNICO.md            # Manual técnico
│   └── MANUAL_USUARIO.md            # Manual de usuario
├── Justificación Proyecto Final.pdf  # Documento de justificación
└── README.md                        # Este archivo
```


## Instalación y Puesta en Marcha

1. Clona el repositorio:
   ```bash
   git clone https://github.com/JulianDevU/labLoanSystem.git
   cd labLoanSystem
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

# Sistema de Préstamo de Equipos (DESACTUALIZADO)

Este proyecto es una API desarrollada con Node.js para la gestión de usuarios, préstamos de equipos y control de acceso mediante roles.

## Estructura del Proyecto

```
backend/
├── config/               # Configuración de la base de datos
│   └── db.js
├── controllers/          # Lógica de controladores para cada entidad
│   ├── authController.js
│   ├── equipmentController.js
│   ├── loanController.js
│   └── userController.js
├── middleware/           # Middlewares para autenticación, manejo de errores, roles, etc.
│   ├── auth.js
│   ├── error.js
│   └── roleCheck.js
├── models/               # Modelos de Mongoose
│   ├── Equipment.js
│   ├── Loan.js
│   └── User.js
├── routes/               # Rutas del API
│   ├── auth.js
│   ├── equipment.js
│   ├── loan.js
│   └── user.js
├── utils/                # Utilidades generales (PDF, validadores)
│   ├── generatePDF.js
│   └── validators.js
├── .env                  # Variables de entorno (no subir a git)
├── .env.example          # Ejemplo de variables de entorno
├── app.js                # Punto de entrada del servidor
├── package.json
└── README.md
```

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <https://github.com/JulianDevU/proyecto_final.git>
   ```

2. Ingresar al directorio `backend`:
   ```bash
   cd backend
   ```

3. Instalar las dependencias:
   ```bash
   npm install
   ```

4. Crear un archivo `.env` basado en `.env.example` con las variables de entorno necesarias (por ejemplo, cadena de conexión a MongoDB).

5. Iniciar el servidor:
   ```bash
   npm start
   ```

## Tecnologías Utilizadas

- Node.js
- Express
- MongoDB + Mongoose
- JWT (para autenticación)
- Validaciones y middlewares personalizados
- Generación de PDF

## Scripts

- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: (si está configurado) Ejecuta el servidor con nodemon para desarrollo

## Autores

Julian Granda Tamayo
Brahian Steven Salazar Isaza
Juan David Obando Álvarez
Juan Alejandro Giraldo Marin

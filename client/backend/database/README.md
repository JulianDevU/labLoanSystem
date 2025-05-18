# Base de Datos MongoDB para Sistema de Préstamos de Laboratorio

Este proyecto utiliza MongoDB con colecciones y campos en español.

## Requisitos
- Tener instalado [MongoDB](https://www.mongodb.com/try/download/community)
- Opcional: Usar MongoDB Atlas para pruebas en la nube

## Estructura de la base de datos
Consulta el archivo `esquema-mongodb.md` para ver la estructura y ejemplos de documentos.

## Cómo crear y probar la base de datos

### 1. Inicia el servidor de MongoDB

En tu terminal:
```
mongod
```

### 2. Conéctate a MongoDB

En otra terminal:
```
mongo
```

### 3. Crea la base de datos y colecciones

Ejecuta en la consola de MongoDB:

```
use labloan

db.createCollection("laboratorios")
db.createCollection("usuarios")
db.createCollection("equipos")
db.createCollection("prestamos")
db.createCollection("notificaciones")
```

### 4. Inserta datos de ejemplo

```
db.laboratorios.insertOne({ nombre: "Laboratorio de Física", descripcion: "Laboratorio dedicado a experimentos de física" })
db.usuarios.insertOne({ nombre: "Juan Pérez", correo: "juan@correo.com", contrasena: "<hash>", tipo: "personal", laboratorio_id: ObjectId("<ID_LABORATORIO>") })
db.equipos.insertOne({ nombre: "Osciloscopio", descripcion: "Osciloscopio digital", categoria: "Instrumentos", cantidad_total: 10, cantidad_disponible: 8, laboratorio_id: ObjectId("<ID_LABORATORIO>") })
```

### 5. Consultar datos

```
db.laboratorios.find()
db.usuarios.find()
db.equipos.find()
```

### 6. Conexión desde la app

Configura tu backend para conectarse a la base de datos `labloan` usando la URI de MongoDB:

```
mongodb://localhost:27017/labloan
```

---

**Nota:** Puedes adaptar los scripts para usar MongoDB Atlas si lo prefieres.

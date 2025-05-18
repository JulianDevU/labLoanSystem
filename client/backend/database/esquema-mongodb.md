# Esquema de Base de Datos MongoDB (Sistema de Préstamos de Laboratorio)

A continuación se describen las colecciones y sus campos, todos en español.

## Colecciones y Esquemas

### laboratorios
- _id: ObjectId
- nombre: string
- descripcion: string

### usuarios
- _id: ObjectId
- nombre: string
- correo: string (único)
- contrasena: string (hash)
- tipo: string ("personal", "administrador")
- laboratorio_id: ObjectId (referencia a laboratorios)

### equipos
- _id: ObjectId
- nombre: string
- descripcion: string
- categoria: string
- cantidad_total: number
- cantidad_disponible: number
- laboratorio_id: ObjectId (referencia a laboratorios)

### prestamos
- _id: ObjectId
- usuario_id: ObjectId (referencia a usuarios)
- equipo_id: ObjectId (referencia a equipos)
- fecha_prestamo: date
- fecha_devolucion: date (planeada)
- fecha_devolucion_real: date (real)
- estado: string ("activo", "devuelto", "vencido")
- evidencia_foto: string (URL o ruta de la foto)

### notificaciones
- _id: ObjectId
- usuario_id: ObjectId (referencia a usuarios)
- mensaje: string
- leido: boolean
- fecha: date

---

# Ejemplo de Documentos

## Laboratorio
```
{
  "_id": ObjectId("..."),
  "nombre": "Laboratorio de Física",
  "descripcion": "Laboratorio dedicado a experimentos de física"
}
```

## Usuario
```
{
  "_id": ObjectId("..."),
  "nombre": "Juan Pérez",
  "correo": "juan@correo.com",
  "contrasena": "<hash>",
  "tipo": "personal",
  "laboratorio_id": ObjectId("...")
}
```

## Equipo
```
{
  "_id": ObjectId("..."),
  "nombre": "Osciloscopio",
  "descripcion": "Osciloscopio digital",
  "categoria": "Instrumentos",
  "cantidad_total": 10,
  "cantidad_disponible": 8,
  "laboratorio_id": ObjectId("...")
}
```

## Préstamo
```
{
  "_id": ObjectId("..."),
  "usuario_id": ObjectId("..."),
  "equipo_id": ObjectId("..."),
  "fecha_prestamo": ISODate("2024-05-18T10:00:00Z"),
  "fecha_devolucion": ISODate("2024-05-25T10:00:00Z"),
  "fecha_devolucion_real": null,
  "estado": "activo",
  "evidencia_foto": "https://.../foto.jpg"
}
```

## Notificación
```
{
  "_id": ObjectId("..."),
  "usuario_id": ObjectId("..."),
  "mensaje": "Recuerda devolver el equipo a tiempo.",
  "leido": false,
  "fecha": ISODate("2024-05-18T10:00:00Z")
}
```

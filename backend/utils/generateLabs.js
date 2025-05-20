import Laboratorio from '../models/Laboratory.js';

const initialLaboratories = [
  { nombre: "Laboratorio de Fisica", descripcion: "Laboratorio de Fisica", slug: "fisica" },
  { nombre: "Laboratorio de Telecomunicaciones", descripcion: "Laboratorio de Telecomunicaciones", slug: "telecomunicaciones" },
  { nombre: "Laboratorio de Software", descripcion: "Laboratorio de Software", slug:"software" }
];

export async function createInitialLaboratories() {
  for (const lab of initialLaboratories) {
    const exists = await Laboratorio.findOne({ nombre: lab.nombre });
    if (!exists) {
      await Laboratorio.create(lab);
      console.log(`Laboratorio ${lab.nombre} creado.`);
    } else {
      console.log(`Laboratorio ${lab.nombre} ya existe.`);
    }
  }
}
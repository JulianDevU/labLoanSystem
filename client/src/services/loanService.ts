import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BACK_ENV

// Interface that matches your updated Mongoose schema
export interface Loan {
  _id?: string;
  tipo_beneficiado: 'estudiante' | 'docente';
  numero_identificacion: string;
  nombre_beneficiado: string;
  correo_beneficiado: string;
  equipos: Array<{
    equipo_id: string;
    cantidad: number;
  }>;
  fecha_prestamo?: Date;
  fecha_devolucion: Date;
  fecha_devolucion_real?: Date | null;
  estado?: 'activo' | 'devuelto' | 'vencido';
  evidencia_foto?: string;
  evidencia_metadata?: {
    originalName: string;
    size: number;
    mimeType: string;
    compressedSize: number;
    compressionRatio: number;
  };
  laboratorio_id: string;
  descripcion?: string;
}

// Interface for API responses with populated data
export interface LoanFromApi {
  _id: string;
  tipo_beneficiado: string;
  numero_identificacion: string;
  nombre_beneficiado: string;
  correo_beneficiado: string;
  equipos: Array<{
    equipo_id: {
      _id: string;
      nombre: string;
      descripcion?: string;
      categoria: string;
      laboratorio_id: {
        _id: string;
        nombre: string;
        descripcion?: string;
      };
    };
    cantidad: number;
  }>;
  equipos_devueltos?: Array<{
    equipo_id: string | { _id: string };
    cantidad: number;
  }>;
  nota_devolucion?: string;
  fecha_prestamo: string;
  fecha_devolucion: string;
  fecha_devolucion_real?: string;
  estado: "activo" | "devuelto" | "vencido";
  evidencia_foto?: string;
  evidencia_metadata?: {
    originalName: string;
    size: number;
    mimeType: string;
    compressedSize: number;
    compressionRatio: number;
  };
  laboratorio_id: {
    _id: string;
    nombre: string;
    descripcion?: string;
  };
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for loan creation - updated for multiple equipment
export interface CreateLoanData {
  tipo_beneficiado: 'estudiante' | 'docente';
  numero_identificacion: string;
  nombre_beneficiado: string;
  correo_beneficiado: string;
  equipos: Array<{
    equipo_id: string;
    cantidad: number;
  }>;
  fecha_devolucion: string;
  evidencia_foto?: string | File;
  evidencia_metadata?: {
    originalName: string;
    size: number;
    mimeType: string;
    compressedSize: number;
    compressionRatio: number;
  }; // <-- Agregado aquí
  laboratorio_id: string;
  descripcion?: string;
}


// Interface for loan updates
export interface UpdateLoanData {
  fecha_devolucion?: string;
  estado?: "activo" | "devuelto" | "vencido";
  evidencia_foto?: string | File;
  evidencia_metadata?: {
    originalName: string;
    size: number;
    mimeType: string;
    compressedSize: number;
    compressionRatio: number;
  }; // <-- También aquí
  descripcion?: string;
  equipos_devueltos?: Array<{
    equipo_id: string;
    cantidad: number;
  }>;
  nota_devolucion?: string;
}


// Interface for filtering loans
export interface LoansFilters {
  estado?: string;
  tipo_beneficiado?: string;
  equipo_id?: string;
  laboratorio_id?: string;
  desde?: string;
  hasta?: string;
  todos?: boolean;
}

// Función auxiliar para convertir File a base64 con metadatos
async function fileToBase64WithMetadata(file: File): Promise<{
  base64: string;
  metadata: {
    originalName: string;
    size: number;
    mimeType: string;
    compressedSize: number;
    compressionRatio: number;
  };
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const metadata = {
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        compressedSize: base64.length,
        compressionRatio: Math.round((1 - (base64.length * 0.75) / file.size) * 100) // Aproximación
      };
      resolve({ base64, metadata });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Create a new loan with multiple equipment support
function validateImageFile(file: File) {
  const maxSize = 3 * 1024 * 1024; // Aumentar a 3MB para dar margen antes de compresión
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('La imagen debe ser menor a 3MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Solo se permiten imágenes JPEG, PNG o WebP');
  }
}

// Función mejorada para crear préstamos
export async function createLoan(data: CreateLoanData) {
  console.log("FUNCIÓN createLoan LLAMADA CON DATOS:", data);

  const token = Cookies.get("token");

  if (!token) {
    console.error("No hay token de autenticación");
    throw new Error("No hay token de autenticación");
  }

  try {
    let requestData = { ...data };
    let headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    // Si es un archivo File, convertir a base64 con metadatos
    if (data.evidencia_foto instanceof File) {
      console.log("Procesando archivo File:", data.evidencia_foto.name);
      
      // Validar archivo
      validateImageFile(data.evidencia_foto);
      
      // Convertir a base64 con metadatos
      const { base64, metadata } = await fileToBase64WithMetadata(data.evidencia_foto);
      
      // Verificar tamaño final del base64
      if (base64.length > 2000000) {
        throw new Error('La imagen comprimida sigue siendo demasiado grande. Intente con una imagen más pequeña.');
      }
      
      requestData = {
        ...data,
        evidencia_foto: base64,
        evidencia_metadata: metadata
      };
      
      console.log("Archivo convertido:", {
        originalSize: metadata.size,
        compressedSize: metadata.compressedSize,
        compressionRatio: metadata.compressionRatio,
        finalBase64Size: base64.length
      });
    }

    const response = await fetch(`${BASE_URL}/api/prestamos`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    console.log("Respuesta recibida:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const result = await response.json();
    console.log("Datos de respuesta:", result);

    if (!response.ok) {
      console.error("Error en la respuesta:", result);
      throw new Error(result.mensaje || result.error || "Error al crear el préstamo");
    }

    return result;
  } catch (error) {
    console.error("Error en la petición:", error);
    throw error;
  }
}

export async function getLoans(filters?: LoansFilters): Promise<LoanFromApi[]> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  // Build query string with filters
  const queryParams = new URLSearchParams();

  if (filters) {
    if (filters.estado) queryParams.append("estado", filters.estado);
    if (filters.tipo_beneficiado) queryParams.append("tipo_beneficiado", filters.tipo_beneficiado);
    if (filters.equipo_id) queryParams.append("equipo_id", filters.equipo_id);
    if (filters.laboratorio_id) queryParams.append("laboratorio_id", filters.laboratorio_id);
    if (filters.desde) queryParams.append("desde", filters.desde);
    if (filters.hasta) queryParams.append("hasta", filters.hasta);
    if (filters.todos) queryParams.append("todos", filters.todos.toString());
  }

  const url = `${BASE_URL}/api/prestamos${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  console.log("Obteniendo préstamos con URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al obtener préstamos");
  }

  return result.data;
}

export async function getLoanById(id: string): Promise<LoanFromApi> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${BASE_URL}/api/prestamos/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al obtener préstamo");
  }

  return result.data;
}

// Update a loan - ACTUALIZADA para manejar archivos
export async function updateLoan(id: string, data: UpdateLoanData) {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  console.log("Actualizando préstamo:", id, "con datos:", data);

  try {
    let requestData: any = { ...data };
    let headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    // Si hay una imagen nueva como File, procesarla
    if (data.evidencia_foto instanceof File) {
      console.log("Procesando nueva imagen para actualización:", data.evidencia_foto.name);
      
      // Validar archivo
      validateImageFile(data.evidencia_foto);
      
      // Convertir a base64 con metadatos
      const { base64, metadata } = await fileToBase64WithMetadata(data.evidencia_foto);
      
      requestData = {
        ...data,
        evidencia_foto: base64,
        evidencia_metadata: metadata
      };
    }

    headers["Content-Type"] = "application/json";

    const response = await fetch(`${BASE_URL}/api/prestamos/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(requestData),
    });

    const result = await response.json();

    if (!response.ok) {
      const fallbackMessage = result?.mensaje || result?.error;
      throw new Error(fallbackMessage || "Error al actualizar préstamo");
    }

    return result.data;
  } catch (error) {
    console.error("Error al actualizar préstamo:", error);
    throw error;
  }
}

// Delete a loan
export async function deleteLoan(id: string): Promise<void> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${BASE_URL}/api/prestamos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al eliminar préstamo");
  }

  return;
}

// Generate a PDF for a loan
export async function generateLoanPDF(
  id: string
): Promise<{ url: string; fileName: string }> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(
    `${BASE_URL}/api/prestamos/${id}/pdf`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al generar PDF del préstamo");
  }

  return result.data;
}

// Generate a report of loans
export async function generateLoansReport(
  filters?: LoansFilters
): Promise<{ url: string; fileName: string; count: number }> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  // Build query string with filters
  const queryParams = new URLSearchParams();

  if (filters) {
    if (filters.estado) queryParams.append("estado", filters.estado);
    if (filters.laboratorio_id)
      queryParams.append("laboratorio_id", filters.laboratorio_id);
    if (filters.desde) queryParams.append("desde", filters.desde);
    if (filters.hasta) queryParams.append("hasta", filters.hasta);
  }

  const url = `${BASE_URL}/api/prestamos/reporte${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al generar reporte de préstamos");
  }

  return result.data;
}

// Check for overdue loans
export async function checkOverdueLoans(): Promise<{
  vencidos: number;
  porVencer: number;
  total: number;
}> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(
    `${BASE_URL}/api/prestamos/verificar-vencidos`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al verificar préstamos vencidos");
  }

  return result.data;
}

// Helper functions for specific loan queries
export async function getLoansByLaboratory(
  laboratoryId: string
): Promise<LoanFromApi[]> {
  return getLoans({ laboratorio_id: laboratoryId });
}

export async function getLoansByBeneficiaryType(
  type: 'estudiante' | 'docente'
): Promise<LoanFromApi[]> {
  return getLoans({ tipo_beneficiado: type });
}

export async function getLoansByEquipment(
  equipmentId: string
): Promise<LoanFromApi[]> {
  return getLoans({ equipo_id: equipmentId });
}

export async function getActiveLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: "activo" });
}

export async function getOverdueLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: "vencido" });
}

export async function getReturnedLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: "devuelto" });
}

export async function registerLoan(data: {
  tipo_beneficiado: 'estudiante' | 'docente';
  numero_identificacion: string;
  nombre_beneficiado: string;
  correo_beneficiado: string;
  equipos: Array<{
    equipo_id: string;
    cantidad: number;
  }>;
  fecha_devolucion: string;
  evidencia_foto?: string | File;
  laboratorio_id: string;
  descripcion?: string;
}) {
  // Usar la función createLoan que ya maneja todo
  return createLoan(data);
}

// Función utilitaria para obtener información de compresión
export function getImageCompressionInfo(loan: LoanFromApi): string | null {
  if (!loan.evidencia_metadata) return null;
  
  const { size, compressedSize, compressionRatio } = loan.evidencia_metadata;
  const originalKB = Math.round(size / 1024);
  const compressedKB = Math.round((compressedSize * 0.75) / 1024); // Aproximación del tamaño real
  
  return `Original: ${originalKB}KB → Comprimida: ${compressedKB}KB (${compressionRatio}% reducción)`;
}

// Función para validar si una imagen necesita ser re-comprimida
export function shouldRecompressImage(file: File): boolean {
  const maxRecommendedSize = 1024 * 1024; // 1MB
  return file.size > maxRecommendedSize;
}
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  type DocumentData
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

// ============ TIPOS ============
export interface CategoriaGlobal {
  id: string;
  nombre: string;
  nameEn?: string;
  nameFr?: string;
  nameDe?: string;
  nameRu?: string;
  activo: boolean;
  order?: number;
  traducciones?: {
    en?: string;
    es?: string;
    fr?: string;
    de?: string;
    ru?: string;
  };
}

export interface Producto {
  id: string;
  nombre: string;
  nameEn?: string;
  nameFr?: string;
  nameDe?: string;
  nameRu?: string;
  descripcion?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionDe?: string;
  descriptionRu?: string;
  precio: number;
  categoriaGlobalId: string;
  activo: boolean;
  destacado?: boolean;
  imagenUrl?: string | null;
  orden?: number;
  traducciones?: {
    en?: {
      nombre?: string;
      descripcion?: string;
    };
    es?: {
      nombre?: string;
      descripcion?: string;
    };
    fr?: {
      nombre?: string;
      descripcion?: string;
    };
    de?: {
      nombre?: string;
      descripcion?: string;
    };
    ru?: {
      nombre?: string;
      descripcion?: string;
    };
  };
}

// ============ CATEGORÍAS ============
export async function getCategoriasGlobales(): Promise<CategoriaGlobal[]> {
  try {
    const snapshot = await getDocs(collection(db, 'categorias_globales'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CategoriaGlobal[];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

export async function getCategoriasActivasGlobales(): Promise<CategoriaGlobal[]> {
  try {
    const snapshot = await getDocs(collection(db, 'categorias_globales'));
    const todas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CategoriaGlobal[];
    return todas.filter(cat => cat.activo === true);
  } catch (error) {
    console.error('Error getting active categories:', error);
    return [];
  }
}

export async function updateCategoriaGlobal(id: string, data: Partial<CategoriaGlobal>): Promise<void> {
  await updateDoc(doc(db, 'categorias_globales', id), data as DocumentData);
}

export async function deleteCategoriaGlobal(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categorias_globales', id));
}

// ============ PRODUCTOS ============
export async function getAllProductos(): Promise<Producto[]> {
  try {
    const snapshot = await getDocs(collection(db, 'productos'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Producto[];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function getProductoById(id: string): Promise<Producto | null> {
  try {
    const snapshot = await getDoc(doc(db, 'productos', id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Producto;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

export async function updateProducto(id: string, data: Partial<Producto>): Promise<void> {
  await updateDoc(doc(db, 'productos', id), data as DocumentData);
}

export async function deleteProducto(id: string): Promise<void> {
  await deleteDoc(doc(db, 'productos', id));
}

export async function createProducto(data: Omit<Producto, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'productos'), data as DocumentData);
  return docRef.id;
}

// ============ IMÁGENES ============
const storage = getStorage();

/**
 * Convierte cualquier imagen (incluido HEIC de cámara) a un Blob JPG estándar.
 * Usa <img> + <canvas> que sí funcionan con HEIC en Safari (iOS).
 */
async function convertToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto del canvas'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('No se pudo convertir a JPG'));
        },
        'image/jpeg',
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer el archivo de imagen'));
    };

    img.src = url;
  });
}

export async function uploadImage(file: File, path: string): Promise<string> {
  // 1. Convertir la imagen (sea HEIC o no) a un Blob JPG estándar.
  //    Esto arregla los archivos HEIC de cámaras de iPhone.
  const jpegBlob = await convertToJpeg(file);

  // 2. Crear un File a partir del Blob JPG para que imageCompression lo procese.
  const jpegFile = new File([jpegBlob], path, { type: 'image/jpeg' });

  // 3. Comprimir el JPG para asegurar que quede ligero.
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  const compressedFile = await imageCompression(jpegFile, options);

  // 4. Subir el archivo final a Firebase Storage.
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressedFile);
  return await getDownloadURL(storageRef);
}
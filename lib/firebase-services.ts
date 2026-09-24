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
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { normalizeHeicFile, isHeicFile } from 'heic-normalize';

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

export async function uploadImage(file: File, path: string): Promise<string> {
  // 1. Normalizar HEIC a JPG (si es necesario) usando heic-normalize
  //    Esta librería funciona en Safari (iOS) y en Chrome/Firefox/Edge (Android)
  let fileToUpload = file;
  
  try {
    if (await isHeicFile(file)) {
      // Convierte HEIC a un File JPG
      fileToUpload = await normalizeHeicFile(file);
    }
  } catch (error) {
    console.warn('No se pudo convertir HEIC, se intentará subir tal cual:', error);
  }

  // 2. Comprimir el archivo resultante (ahora siempre es JPG)
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  const compressedFile = await imageCompression(fileToUpload, options);

  // 3. Subida directa desde el navegador a Firebase Storage
  //    Usamos uploadBytesResumable para evitar el límite de 4.5MB de Vercel
  const storageRef = ref(storage, path);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, compressedFile);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Subida: ${progress.toFixed(2)}%`);
      },
      (error) => {
        console.error('Error al subir:', error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
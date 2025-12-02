import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

// Firebase configuration - Replace with your Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

export const initializeFirebase = (): { app: FirebaseApp; db: Firestore; auth: Auth } => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  auth = getAuth(app);

  return { app, db, auth };
};

// Get Firestore instance
export const getDb = (): Firestore => {
  if (!db) {
    initializeFirebase();
  }
  return db;
};

// Get Auth instance
export const getAuthInstance = (): Auth => {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
};

// Collection names
export const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  CATEGORIES: 'categories',
  MENU_ITEMS: 'menuItems',
  ORDERS: 'orders',
  TABLES: 'tables',
  USERS: 'users',
  SETTINGS: 'settings',
} as const;

// Generic CRUD operations
export const firestoreService = {
  // Get a single document
  async getDocument<T>(collectionName: string, documentId: string): Promise<T | null> {
    const docRef = doc(getDb(), collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  },

  // Get all documents in a collection
  async getCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    const collectionRef = collection(getDb(), collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  },

  // Add a new document
  async addDocument<T extends DocumentData>(
    collectionName: string,
    data: Omit<T, 'id'>
  ): Promise<string> {
    const collectionRef = collection(getDb(), collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Update a document
  async updateDocument<T extends DocumentData>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> {
    const docRef = doc(getDb(), collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete a document
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    const docRef = doc(getDb(), collectionName, documentId);
    await deleteDoc(docRef);
  },

  // Subscribe to real-time updates
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
  ): () => void {
    const collectionRef = collection(getDb(), collectionName);
    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(data);
    });

    return unsubscribe;
  },

  // Subscribe to a single document
  subscribeToDocument<T>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void
  ): () => void {
    const docRef = doc(getDb(), collectionName, documentId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  },
};

// Auth helpers
export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(getAuthInstance(), email, password);
    return userCredential.user;
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(getAuthInstance());
  },

  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(getAuthInstance(), callback);
  },

  getCurrentUser(): User | null {
    return getAuthInstance().currentUser;
  },
};

// Re-export Firestore utilities
export { collection, doc, query, where, orderBy, Timestamp };

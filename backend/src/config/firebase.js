import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.PROJECT_ID,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin; 
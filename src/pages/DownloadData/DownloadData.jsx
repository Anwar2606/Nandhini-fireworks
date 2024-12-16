import { collection, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from '../firebase';

async function fetchDataAndGenerateExcel(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Convert data to Excel
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, 'data.xlsx');
}

export default fetchDataAndGenerateExcel;

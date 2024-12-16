import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DownloadBillingData = () => {

  const downloadBillingData = async () => {
    try {
      const billingCollectionRef = collection(db, 'billing');
      const billingSnapshot = await getDocs(billingCollectionRef);
      const billingData = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(billingData))}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = 'billing_data.json';

      link.click();
    } catch (error) {
      console.error('Error downloading billing data:', error);
    }
  };

  return (
    <div>
      <button onClick={downloadBillingData}>Download Billing Data</button>
    </div>
  );
};

export default DownloadBillingData;

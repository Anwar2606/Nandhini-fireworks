import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';

const Edit = () => {
  const [invoices, setInvoices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'billing'));
        const invoiceData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvoices(invoiceData);
      } catch (error) {
        console.error("Error fetching invoices: ", error);
      }
    };

    fetchInvoices();
  }, []);

  const handleEditClick = (invoice) => {
    setEditingId(invoice.id);
    setEditedValues({
      ...invoice,
      productDetails: Array.isArray(invoice.productDetails) ? [...invoice.productDetails] : [] // Ensure it's an array
    });
  };

  const handleInputChange = (e, field) => {
    setEditedValues({
      ...editedValues,
      [field]: e.target.value,
    });
  };

  const handleProductDetailChange = (index, field, value) => {
    const updatedProductDetails = Array.isArray(editedValues.productDetails) ? [...editedValues.productDetails] : [];
    updatedProductDetails[index] = {
      ...updatedProductDetails[index],
      [field]: value
    };
    setEditedValues({
      ...editedValues,
      productDetails: updatedProductDetails
    });
  };

  const handleSave = async () => {
    try {
      const invoiceDocRef = doc(db, 'billing', editingId);
      await updateDoc(invoiceDocRef, editedValues);
      alert('Invoice updated successfully!');
      setEditingId(null);
      setEditedValues({});
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const invoice = editedValues;

    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 10, 10);
    doc.text(`Customer Name: ${invoice.customerName}`, 10, 20);
    doc.text(`CGST Amount: ₹${Number(invoice.cgstAmount).toFixed(2)}`, 10, 30);
    doc.text(`SGST Amount: ₹${Number(invoice.sgstAmount).toFixed(2)}`, 10, 40);
    doc.text(`IGST Amount: ₹${Number(invoice.igstAmount).toFixed(2)}`, 10, 50);
    doc.text(`Total Amount: ₹${Number(invoice.totalAmount).toFixed(2)}`, 10, 60);

    let y = 70;
    (invoice.productDetails || []).forEach((product, index) => {
      doc.text(`Product ${index + 1}: ${product.name}`, 10, y);
      doc.text(`Product ID: ${product.productId}`, 10, y + 10);
      doc.text(`Quantity: ${product.quantity}`, 10, y + 20);
      doc.text(`Sale Price: ₹${Number(product.saleprice).toFixed(2)}`, 10, y + 30);
      y += 40;
    });

    doc.save(`${invoice.invoiceNumber}_updated_invoice.pdf`);
  };

  return (
    <div className="invoice-table">
      <table>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Customer Name</th>
            <th>CGST Amount</th>
            <th>SGST Amount</th>
            <th>IGST Amount</th>
            <th>Total Amount</th>
            <th>Product Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td>
                {editingId === invoice.id ? (
                  <input
                    type="text"
                    value={editedValues.invoiceNumber || ''}
                    onChange={(e) => handleInputChange(e, 'invoiceNumber')}
                  />
                ) : (
                  invoice.invoiceNumber
                )}
              </td>
              <td>
                {editingId === invoice.id ? (
                  <input
                    type="text"
                    value={editedValues.customerName || ''}
                    onChange={(e) => handleInputChange(e, 'customerName')}
                  />
                ) : (
                  invoice.customerName
                )}
              </td>
              <td>
                {editingId === invoice.id ? (
                  <input
                    type="number"
                    value={editedValues.cgstAmount || ''}
                    onChange={(e) => handleInputChange(e, 'cgstAmount')}
                  />
                ) : (
                  `₹${Number(invoice.cgstAmount).toFixed(2)}`
                )}
              </td>
              <td>
                {editingId === invoice.id ? (
                  <input
                    type="number"
                    value={editedValues.sgstAmount || ''}
                    onChange={(e) => handleInputChange(e, 'sgstAmount')}
                  />
                ) : (
                  `₹${Number(invoice.sgstAmount).toFixed(2)}`
                )}
              </td>
              <td>
                {editingId === invoice.id ? (
                  <input
                    type="number"
                    value={editedValues.igstAmount || ''}
                    onChange={(e) => handleInputChange(e, 'igstAmount')}
                  />
                ) : (
                  `₹${Number(invoice.igstAmount).toFixed(2)}`
                )}
              </td>
              <td>
                {editingId === invoice.id ? (
                  <input
                    type="number"
                    value={editedValues.totalAmount || ''}
                    onChange={(e) => handleInputChange(e, 'totalAmount')}
                  />
                ) : (
                  `₹${Number(invoice.totalAmount).toFixed(2)}`
                )}
              </td>
              <td>
                {editingId === invoice.id ? (
                  (editedValues.productDetails || []).map((product, index) => (
                    <div key={index} className="product-detail">
                      <input
                        type="text"
                        value={product.name || ''}
                        onChange={(e) => handleProductDetailChange(index, 'name', e.target.value)}
                        placeholder="Product Name"
                      />
                      <input
                        type="text"
                        value={product.productId || ''}
                        onChange={(e) => handleProductDetailChange(index, 'productId', e.target.value)}
                        placeholder="Product ID"
                      />
                      <input
                        type="number"
                        value={product.quantity || ''}
                        onChange={(e) => handleProductDetailChange(index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                      />
                      <input
                        type="number"
                        value={product.saleprice || ''}
                        onChange={(e) => handleProductDetailChange(index, 'saleprice', e.target.value)}
                        placeholder="Sale Price"
                      />
                    </div>
                  ))
                ) : (
                  <div>
                    {(invoice.productDetails || []).map((product, index) => (
                      <div key={index}>
                        <div>Name: {product.name}</div>
                        <div>Product ID: {product.productId}</div>
                        <div>Quantity: {product.quantity}</div>
                        <div>Sale Price: ₹{Number(product.saleprice).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td>
                {editingId === invoice.id ? (
                  <>
                    <button onClick={handleSave}>
                      <FontAwesomeIcon icon={faSave} /> Save
                    </button>
                    <button onClick={generatePDF}>
                      <FontAwesomeIcon icon={faDownload} /> Download PDF
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEditClick(invoice)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Edit;

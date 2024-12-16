import React, { useState, useEffect } from 'react';
import './EditModal.css'; // Import your CSS for the modal

const EditModal = ({ isOpen, onClose, data, onSave }) => {
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    setEditedData(data || {});
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(editedData);
    onClose(); // Close the modal after saving
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Edit Details</h2>
        <form>
          <label>
            Invoice Number:
            <input
              type="text"
              name="invoiceNumber"
              value={editedData.invoiceNumber || ''}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Customer Name:
            <input
              type="text"
              name="customerName"
              value={editedData.customerName || ''}
              onChange={handleInputChange}
            />
          </label>
          <label>
            CGST Amount:
            <input
              type="number"
              name="cgstAmount"
              value={editedData.cgstAmount || ''}
              onChange={handleInputChange}
            />
          </label>
          <label>
            SGST Amount:
            <input
              type="number"
              name="sgstAmount"
              value={editedData.sgstAmount || ''}
              onChange={handleInputChange}
            />
          </label>
          <label>
            IGST Amount:
            <input
              type="number"
              name="igstAmount"
              value={editedData.igstAmount || ''}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Total Amount:
            <input
              type="number"
              name="totalAmount"
              value={editedData.totalAmount || ''}
              onChange={handleInputChange}
            />
          </label>
          <button type="button" onClick={handleSave}>Save</button>
        </form>
      </div>
    </div>
  );
};

export default EditModal;

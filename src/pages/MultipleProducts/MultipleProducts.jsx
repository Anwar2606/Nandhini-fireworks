// src/components/ProductForm.js
import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./MultipleProducts.css"; // Import the CSS file

const ProductForm = () => {
  const [product, setProduct] = useState({ name: "", regularprice: "",saleprice:"" ,quantity: "",  });
  const [submittedProducts, setSubmittedProducts] = useState([]);

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: name === "image" ? files[0] : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const productCollection = collection(db, "products");

  

    const docRef = await addDoc(productCollection, {
      name: product.name,
      saleprice: parseFloat(product.saleprice),
      regularprice:parseFloat(product.regularprice),
      quantity: parseInt(product.quantity),
      // imageUrl: imageUrl,
    });

    setSubmittedProducts(prevProducts => [
      ...prevProducts,
      {
        id: docRef.id,
        name: product.name,
        regularprice: product.regularprice,
        saleprice:product.saleprice,
        quantity: product.quantity,
        // imageUrl: imageUrl,
      }
    ]);

    setProduct({ name: "", regularprice: "", saleprice:"",quantity: "" });
  };

  return (
    <div className="container">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={product.name}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="regularprice"
              placeholder="Regular Price"
              value={product.regularprice}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="saleprice"
              placeholder="Sales Price"
              value={product.saleprice}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={product.quantity}
              onChange={handleInputChange}
            />
            {/* <input
              type="file"
              name="image"
              onChange={handleInputChange}
            /> */}
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
      <div className="list-container">
        <h2>Submitted Products</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Regular price</th>
              <th>Sales price</th>
              <th>Quantity</th>
              
            </tr>
          </thead>
          <tbody>
            {submittedProducts.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>${product.regularprice}</td>
                <td>${product.saleprice}</td>
                <td>{product.quantity}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductForm;

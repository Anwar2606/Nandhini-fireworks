// // src/components/EditProductPage.js
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { db, storage } from "../firebase";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import './EditProduct.css';

// const EditProductPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [name, setName] = useState("");
//   const [sno, setSno] = useState("");
//   const [regularprice, setRegularPrice] = useState(0);
//   const [saleprice, setSalePrice] = useState(0);
//   const [image, setImage] = useState(null);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       const productDoc = doc(db, "products", id);
//       const docSnap = await getDoc(productDoc);
//       if (docSnap.exists()) {
//         const productData = docSnap.data();
//         setProduct(productData);
//         setName(productData.name);
//         setSno(productData.sno);
//         setRegularPrice(productData.regularprice);
//         setSalePrice(productData.saleprice);
//         // setQuantity(productData.quantity);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   const handleFileChange = (event) => {
//     setImage(event.target.files[0]);
//   };

//   const handleUpdate = async () => {
   

//     const productData = {
//       name,
//       sno,
//       regularprice: parseFloat(regularprice),
//       saleprice: parseInt(saleprice),
//       // imageUrl,
//     };

//     const productRef = doc(db, "products", id);
//     await updateDoc(productRef, productData);

//     navigate("/products");
//   };

//   if (!product) return <div>Loading...</div>;

//   return (
//     <div className="Edit-page">
//       <h2 className="Page-title">Edit Product</h2>
//       <label>Product name:</label>
//       <input
//       className="Edit-input1"
//         type="text"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Product Name"
//       />
//       <label>Product code:</label>
//       <input
//       className="Edit-input1"
//         type="text"
//         value={sno}
//         onChange={(e) => setSno(e.target.value)}
//         placeholder="Product Code"
//       />
//       <label>Regular Price:</label>
//       <input
//       className="Edit-input2"
//         type="number"
//         value={regularprice}
//         onChange={(e) => setRegularPrice(e.target.value)}
//         placeholder="Regular Price"
//       />
//        <label>Sale Price:</label>
//      <input
//       className="Edit-input2"
//         type="number"
//         value={saleprice}
//         onChange={(e) => setSalePrice(e.target.value)}
//         placeholder="Sale Price"
//       />
//       <input type="file" className="Edit-input3" onChange={handleFileChange} style={{display:"none"}}/>
//       <button className="Edit-btn" onClick={handleUpdate}>Update</button>
//       <button className="Edit-btn" onClick={() => navigate("/products")}>Cancel</button>
//     </div>
//   );
// };

// export default EditProductPage;
// src/components/EditProductPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './EditProduct.css';
import { FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { TbListNumbers } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/nandhini-logo.png";
import { IoIosPerson } from "react-icons/io";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [sno, setSno] = useState("");
  const [inStock, setInStock] = useState(false);
  const [regularPrice, setRegularPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = doc(db, "products", id);
      const docSnap = await getDoc(productDoc);
      if (docSnap.exists()) {
        const productData = docSnap.data();
        setProduct(productData);
        setName(productData.name);
        setQuantity(productData.quantity);
        setInStock(productData.inStock);
        setSno(productData.sno);
        setRegularPrice(productData.regularprice);
        setSalePrice(productData.saleprice);
        setCategory(productData.category);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async () => {
    const productData = {
      name,
      quantity,
      sno,
      inStock,
      regularprice: parseFloat(regularPrice),
      saleprice: parseInt(salePrice),
      category,
    };

    const productRef = doc(db, "products", id);
    await updateDoc(productRef, productData);

    navigate("/products");
  };

  if (!product) return <div>Loading...</div>;
  const toggleSidebar = () => setIsOpen(!isOpen);
  return (
    <div className="main-container">
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <ul>
          <li
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "20px 0",
              borderBottom: "2px solid #c3b6d0",
              paddingBottom: "10px",
            }}
          >
            {isOpen ? (
              "Nandhini Fireworks"
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: "-14px",
                }}
              >
                <img
                  src={Logo}
                  alt="Nandhini Fireworks Logo"
                  style={{
                    width: "50px",
                    height: "auto",
                  }}
                />
              </div>
            )}
          </li>
          <li>
            <Link to="/newhome">
              <FaHome /> {isOpen && <span>Home</span>}
            </Link>
          </li>
          <li>
            <Link to="/products">
              <AiFillProduct /> {isOpen && <span>Products</span>}
            </Link>
          </li>
          <li>
            <Link to="/allbills">
              <FaEye /> {isOpen && <span>All Bills</span>}
            </Link>
          </li>
          <li>
            <Link to="/editbill">
              <FaEdit /> {isOpen && <span>Edit Bills</span>}
            </Link>
          </li>
          <li>
            <Link to="/bill">
              <FaFileInvoice /> {isOpen && <span>Invoice</span>}
            </Link>
          </li>
          <li><Link to="/showcustomers"><IoIosPerson /> {isOpen && <span>Customers</span>}</Link></li>
          <li>
            <Link to="/invoice">
              <TbListNumbers />
              {isOpen && <span>Invoice Numbers</span>}
            </Link>
          </li>
          <li>
            <Link to="/">
              <MdLogout /> {isOpen && <span>Logout</span>}
            </Link>
          </li>
          <li className="menu-item">
            <button
              onClick={toggleSidebar}
              style={{
                padding: "10px",
                backgroundColor: "#1b2594",
                border: "none",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                cursor: "pointer",
              }}
            >
              {isOpen ? (
                <FaArrowCircleLeft style={{ color: "white" }} />
              ) : (
                <FaArrowAltCircleRight style={{ color: "white" }} />
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content-container">
        <div className="Edit-page">
          <h2 className="Page-title">Edit Product</h2>
          <label>Product name:</label>
          <input
            className="Edit-input1"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name"
          />
          <label>Product code:</label>
          <input
            className="Edit-input1"
            type="text"
            value={sno}
            onChange={(e) => setSno(e.target.value)}
            placeholder="Product Code"
          />
          <label>Regular Price:</label>
          <input
            className="Edit-input2"
            type="number"
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value)}
            placeholder="Regular Price"
          />
          <label>Sale Price:</label>
          <input
            className="Edit-input2"
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Sale Price"
          />
          <label>Quantity:</label>
          <input
            className="Edit-input1"
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
          /><br></br>
          <label>In Stock:</label>
          <select
            className="custom-select"
            value={inStock}
            onChange={(e) => setInStock(e.target.value)}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
          <br />
          <br />
          <button className="Edit-btn" onClick={handleUpdate}>
            Update
          </button>
          <button
            className="Edit-btn"
            onClick={() => navigate("/products")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;
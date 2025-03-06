import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Adjust the path based on your project structure
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaArrowAltCircleRight, FaArrowCircleLeft, FaEdit, FaEye, FaFileInvoice, FaHome, FaPlus, FaTruck } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { IoIosPerson } from "react-icons/io";
import { TbListNumbers } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/nandhini-logo.png"; 

const ShowTransportDetails = () => {
  const [transportDetails, setTransportDetails] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "transportDetails"), (snapshot) => {
      const transportData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransportDetails(transportData);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div className="main-container2">
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <ul>
          <li className="sidebar-title"
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "20px 0",
              borderBottom: "2px solid #c3b6d0",
              paddingBottom: "10px",
            }}>
            {isOpen ? (
              "Nandhini Fireworks"
            ) : (
              <div className="logo-container">
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
          <li><Link to="/newhome"><FaHome /> {isOpen && <span>Home</span>}</Link></li>
          <li><Link to="/products"><AiFillProduct /> {isOpen && <span>Products</span>}</Link></li>
          <li><Link to="/allbills"><FaEye /> {isOpen && <span>All Bills</span>}</Link></li>
          <li><Link to="/editbill"><FaEdit /> {isOpen && <span>Edit Bills</span>}</Link></li>
          <li><Link to="/bill"><FaFileInvoice /> {isOpen && <span>Invoice</span>}</Link></li>
          <li><Link to="/showcustomers"><IoIosPerson /> {isOpen && <span>Customers</span>}</Link></li>
           <li><Link to="/showtransport"><FaTruck /> {isOpen && <span>Transport Details</span>}</Link></li>
          <li><Link to="/invoice"><TbListNumbers /> {isOpen && <span>Invoice Numbers</span>}</Link></li>
          <li><Link to="/"><MdLogout /> {isOpen && <span>Logout</span>}</Link></li>
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
      <div className="content">
        <div className="container">
          <div className="header">
            <h2 className="heading">Transport Details </h2>
            <Link to="/addTransport" className="add-transport-btn">
               Add Transport Details
            </Link>
          </div>

          <table className="products-table">
            <thead>
              <tr>
                <th>Transport Name</th>
                <th>GSTIN</th>
              </tr>
            </thead>
            <tbody>
              {transportDetails.length > 0 ? (
                transportDetails.map((item) => (
                  <tr key={item.id}>
                    <td>{item.transportName}</td>
                    <td>{item.transportGstin}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No transport details found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSS Styling */}
      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .add-transport-btn {
          background-color: #1b2594;
          color: white;
          padding: 10px 15px;
          display: flex;
          align-items: center;
          border-radius: 5px;
          text-decoration: none;
          font-size: 14px;
        }

        .add-transport-btn svg {
          margin-right: 5px;
        }

        .add-transport-btn:hover {
          background-color: #161d7a;
        }
      `}</style>
    </div>
  );
};

export default ShowTransportDetails;

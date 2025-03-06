import React, { useEffect, useState } from "react";
import { db } from "../../pages/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaEye,
  FaEdit,
  FaFileInvoice,
  FaArrowCircleLeft,
  FaArrowAltCircleRight,
  FaTruck,
} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import { TbListNumbers } from "react-icons/tb";
import Logo from "../assets/nandhini-logo.png"; // Replace with your logo path
import { IoIosPerson } from "react-icons/io";

const ShowCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customer"));
        const customerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers: ", error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="main-container2">
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
           <li><Link to="/showtransport"><FaTruck /> {isOpen && <span>Transport Details</span>}</Link></li>
          <li>
            <Link to="/invoice">
              <TbListNumbers /> {isOpen && <span>Invoice Numbers</span>}
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
      <div className="content">
        <div className="all-bills-page">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Customer Details</h1>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#1b2594",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onClick={() => navigate("/addcustomer")}
            >
              Add Customer
            </button>
          </div>
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>State</th>
                <th>Phone No</th>
                <th>GSTIN</th>
                <th>PAN</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.customerName}</td>
                    <td>{customer.customerAddress}</td>
                    <td>{customer.customerState}</td>
                    <td>{customer.customerPhoneNo}</td>
                    <td>{customer.customerGSTIN}</td>
                    <td>{customer.customerPan}</td>
                    <td>{customer.customerEmail}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No customer data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShowCustomers;

import React, { useState } from "react";
import axios from "axios";
import { Wallet, JsonRpcProvider, Contract } from "ethers";
import AuthABI from "./Auth.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
const RPC_URL = process.env.REACT_APP_RPC_URL;
const BACKEND_URL = "http://localhost:3001";

function App() {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [targetAddress, setTargetAddress] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [fetchedRole, setFetchedRole] = useState("");
  const [authContract, setAuthContract] = useState(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [email, setEmail] = useState(""); 
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");

  const provider = new JsonRpcProvider(RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);

  const initializeContract = () => {
    const contract = new Contract(CONTRACT_ADDRESS, AuthABI.abi, wallet);
    setAuthContract(contract);
    return contract;
  };

  const handleBackendLogin = async () => {
    try {
      const contract = initializeContract();
      const address = await wallet.getAddress();
      setAccount(address);

      // Determine admin status from on-chain role
      const role = await contract.getRole(address);
      setIsAdmin(role === "admin");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    }
  };

  const requestOTP = async () => {
    if (!email) return alert("Please enter your email");
    try {
      const res = await axios.post(`${BACKEND_URL}/request-otp`, { email });
      alert(res.data.message);
      setOtpRequested(true);
    } catch (err) {
      console.error("OTP Request Error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("Failed to request OTP");
      }
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert("Please enter the OTP");
    try {
      const res = await axios.post(`${BACKEND_URL}/verify-otp`, { email, code: otp });
      if (res.data.success) {
        alert("OTP verified. Access granted.");
        setOtpVerified(true);
      } else {
        alert(res.data.error || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("OTP verification failed");
      }
    }
  };

  const assignRole = async () => {
    if (!authContract || !otpVerified) return alert("Not authorized");
    if (!targetAddress || !targetRole) return alert("Please enter both address and role");
    try {
      const tx = await authContract.assignRole(targetAddress, targetRole);
      await tx.wait();
      alert("Role assigned successfully!");
    } catch (err) {
      console.error("Assign Role Error:", err);
      alert(err.error?.message || "Error assigning role");
    }
  };

  const checkRole = async () => {
    if (!authContract || !otpVerified) return alert("Not authorized");
    if (!targetAddress) return alert("Please enter an address to check");
    try {
      const role = await authContract.getRole(targetAddress);
      setFetchedRole(role);
    } catch (err) {
      console.error("Check Role Error:", err);
      alert("Failed to fetch role");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>EtherLogin</h1>

      <button onClick={handleBackendLogin}>Connect with your address</button>
      {account && <p>Connected address: {account}</p>}
      <p>Status: {isAdmin ? "Admin access granted" : "Not an admin"}</p>

      <div style={{ marginTop: 20 }}>
        <h3>OTP Verification</h3>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={requestOTP}>Request OTP</button>
      </div>

      {otpRequested && !otpVerified && (
        <div style={{ marginTop: 10 }}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </div>
      )}

      {otpVerified && (
        <>
          <h2>Admin Panel</h2>
          {isAdmin ? (
            <div>
              <input
                type="text"
                placeholder="Target Address"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Role to assign"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
              <button onClick={assignRole}>Assign Role</button>
              <button onClick={checkRole}>Check Role</button>
              {fetchedRole && <p>Fetched Role: {fetchedRole}</p>}
            </div>
          ) : (
            <p>Only admin can access role management features.</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
// src/components/ConnectWallet.js

import React, { useState } from "react";
import { BrowserProvider } from "ethers";

function ConnectWallet({ onConnect }) {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install it.");
        return;
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create provider and signer
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log("Connected wallet:", address);
      setWalletAddress(address);
      onConnect?.(address);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>
        {walletAddress ? `Wallet: ${walletAddress}` : "Connect Wallet"}
      </button>
      {walletAddress && (
        <div style={{ marginTop: "1rem" }}>
          <strong>Connected Account:</strong>
          <div style={{ wordBreak: "break-all" }}>{walletAddress}</div>
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;

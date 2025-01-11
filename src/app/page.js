"use client";
import React, { useState, useEffect } from "react";
import { Wallet, ArrowRightLeft, Lock } from "lucide-react";
import "./globals.css";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState({
    tokenA: "0.00",
    tokenB: "0.00",
    stakedAmount: "0.00",
  });

  useEffect(() => {
    // Check if ArConnect is installed
    if (window.arweaveWallet) {
      addEventListener("arweaveWalletLoaded", handleWalletLoad);
    } else {
      console.log("ArConnect is not installed!");
    }

    return () => {
      removeEventListener("arweaveWalletLoaded", handleWalletLoad);
    };
  }, []);

  const handleWalletLoad = async () => {
    try {
      // Check existing permissions
      const permissions = await window.arweaveWallet.getPermissions();
      if (permissions.length > 0) {
        const address = await window.arweaveWallet.getActiveAddress();
        setWalletAddress(address);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error checking wallet permissions:", error);
    }
  };

  const handleConnect = async () => {
    try {
      // Request permissions
      await window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
        "ACCESS_PUBLIC_KEY",
      ]);

      // Get wallet address
      const address = await window.arweaveWallet.getActiveAddress();
      setWalletAddress(address);
      setIsConnected(true);

      // You could fetch initial balances here
      // fetchBalances(address);
    } catch (error) {
      console.error("Error connecting to ArConnect:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await window.arweaveWallet.disconnect();
      setIsConnected(false);
      setWalletAddress("");
      setWalletBalance({
        tokenA: "0.00",
        tokenB: "0.00",
        stakedAmount: "0.00",
      });
    } catch (error) {
      console.error("Error disconnecting from ArConnect:", error);
    }
  };

  const handleStake = async () => {
    try {
      // Example transaction creation (you'll need to modify based on your contract)
      // const transaction = await arweave.createTransaction({
      //   target: "YOUR_STAKING_CONTRACT_ADDRESS",
      //   quantity: arweave.ar.arToWinston(stakeAmount)
      // });

      // await window.arweaveWallet.sign(transaction);
      // await arweave.transactions.post(transaction);

      console.log(
        `Staking ${stakeAmount} tokens from address ${walletAddress}`
      );
      setShowStakeModal(false);
    } catch (error) {
      console.error("Error staking tokens:", error);
    }
  };

  const Modal = ({ children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            ArWeave Staking Platform
          </h1>
          <div className="flex gap-2">
            {isConnected && (
              <div className="text-sm text-gray-600 mr-2 flex items-center">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            )}
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${
                  isConnected
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              <Wallet className="h-4 w-4" />
              {isConnected ? "Disconnect" : "Connect ArConnect"}
            </button>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Balance
              </h2>
              <p className="text-sm text-gray-500">View your token holdings</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Token A Balance:</span>
                <span className="font-semibold">{walletBalance.tokenA}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Token B Balance:</span>
                <span className="font-semibold">{walletBalance.tokenB}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Staked Amount:</span>
                <span className="font-semibold">
                  {walletBalance.stakedAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Staking Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Stake Tokens
              </h2>
              <p className="text-sm text-gray-500">
                Stake Token A to earn Token B
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Amount to Stake</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected}
                />
              </div>
              <button
                onClick={() => setShowStakeModal(true)}
                disabled={!isConnected}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                Stake Tokens
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">APR</h3>
            <p className="text-3xl font-bold text-green-600">10%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Value Locked
            </h3>
            <p className="text-3xl font-bold text-gray-900">1,234,567 TOKENA</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Rewards
            </h3>
            <p className="text-3xl font-bold text-purple-600">25.5 TOKENB</p>
          </div>
        </div>

        {/* Stake Confirmation Modal */}
        {showStakeModal && (
          <Modal>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirm Staking
              </h3>
              <p className="text-gray-600">
                You are about to stake {stakeAmount} Token A from address{" "}
                {walletAddress}. This action cannot be undone immediately and
                has a minimum staking period.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowStakeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStake}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default App;

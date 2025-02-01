import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function VolumeDashboard() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractAddress, setContractAddress] = useState("");
  const [runTime, setRunTime] = useState(10);
  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    fetchVolumeData();
    const interval = setInterval(fetchVolumeData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchVolumeData = async () => {
    try {
      const response = await fetch(`/api/volume?contract=${contractAddress}&runtime=${runTime}`);
      const data = await response.json();
      setVolumeData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching volume data:", error);
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!publicKey) {
      alert("Please connect a wallet first.");
      return;
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(Hx35pkiWEiWfnuz5EBQNuBGbjUcny59J86QmNwTDGF9R), // Replace with actual pool address
          lamports: parseFloat(depositAmount) * 1e9,
        })
      );
      await sendTransaction(transaction, connection);
      alert("Deposit successful!");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const chartData = {
    labels: volumeData.map((entry) => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Trading Volume (SOL)",
        data: volumeData.map((entry) => entry.volume),
        fill: false,
        borderColor: "#4F46E5",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Raydium Volume Tracker</h1>
      <WalletMultiButton className="mb-4" />
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          className="p-2 border rounded w-full mb-2"
        />
        <input
          type="number"
          placeholder="Enter Runtime (minutes)"
          value={runTime}
          onChange={(e) => setRunTime(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="number"
          placeholder="Enter Deposit Amount (SOL)"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <Button className="mt-2" onClick={handleDeposit}>
          Deposit Funds
        </Button>
      </div>
      <Card className="p-4">
        <CardContent>
          {loading ? (
            <p>Loading volume data...</p>
          ) : (
            <Line data={chartData} />
          )}
        </CardContent>
      </Card>
      <Button className="mt-4" onClick={fetchVolumeData}>
        Refresh Data
      </Button>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Slider from '@/components/ui/slider';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const EggEconGame: React.FC = () => {
  const [balance, setBalance] = useState<number>(10);
  const [chickens, setChickens] = useState<number>(0);
  const [eggs, setEggs] = useState<number>(0);
  const [eggPrice, setEggPrice] = useState<number>(0.1);
  const [demand, setDemand] = useState<number>(0);
  const [supplyDemandData, setSupplyDemandData] = useState<any[]>([]);

  const maxPrice = 10; // Moved outside useEffect

  const calculateDemand = (price: number) => {
    const maxDemand = 10;
    const demand = maxDemand * Math.max(0, 1 - price / maxPrice);
    return Math.floor(demand);
  };

  const calculateSupply = (price: number) => {
    const maxSupply = chickens * 1;
    const supply = maxSupply * (price / maxPrice);
    return Math.floor(supply);
  };

  const generateSupplyDemandData = () => {
    const data = [];
    for (let price = 0; price <= maxPrice; price += 0.5) {
      const demandQty = calculateDemand(price);
      const supplyQty = calculateSupply(price);
      data.push({ price: price.toFixed(1), Demand: demandQty, Supply: supplyQty });
    }
    return data;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEggs((prevEggs) => prevEggs + chickens);

      const newDemand = calculateDemand(eggPrice);
      setDemand(newDemand);

      setEggs((prevEggs) => {
        const eggsToSell = Math.min(prevEggs, newDemand);
        const revenue = eggsToSell * eggPrice;
        setBalance((prevBalance) => prevBalance + revenue);
        return prevEggs - eggsToSell;
      });

      // Update supply-demand data for the chart
      const data = generateSupplyDemandData();
      setSupplyDemandData(data);

      // Debugging: Log the data
      console.log('Supply-Demand Data:', data);
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array

  const handleBuyChicken = () => {
    if (balance >= 10) {
      setBalance((prevBalance) => prevBalance - 10);
      setChickens((prevChickens) => prevChickens + 1);
    }
  };

  const handleEggPriceChange = (value: number) => {
    setEggPrice(value);
  };

  return (
    <div className="App hub">
      <div className="w-full mx-auto flex flex-col items-center">
        <h1 className="text-center text-2xl font-bold my-4">Egg Econ</h1>
        <Card className="w-full max-w-5xl">
          <CardContent className="h-full flex flex-col space-y-4">
            <div className="flex justify-between text-white">
              <div>Balance: {balance.toFixed(2)} Coins</div>
              <div>Chickens: {chickens}</div>
              <div>Eggs: {eggs}</div>
            </div>
            <div>
              <Button onClick={handleBuyChicken} disabled={balance < 10}>
                Buy Chicken (10 Coins)
              </Button>
            </div>
            <div>
              <div className="flex items-center space-x-4">
                <Slider
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={eggPrice}
                  onChange={handleEggPriceChange}
                  className="w-full"
                />
                <Input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={eggPrice}
                  onChange={(e) =>
                    setEggPrice(
                      Math.max(0.1, Math.min(10, parseFloat(e.target.value) || 0.1))
                    )
                  }
                  className="bg-slate-700 text-white w-24"
                />
              </div>
            </div>
            <div className="text-white">
              <div>Current Demand: {demand} eggs per turn</div>
            </div>
            {/* Supply-Demand Curve */}
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={supplyDemandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="price"
                    label={{ value: 'Price', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Demand" stroke="#8884d8" dot={false} />
                  <Line type="monotone" dataKey="Supply" stroke="#82ca9d" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EggEconGame;

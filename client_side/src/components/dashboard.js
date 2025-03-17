import React, { useState, useEffect } from 'react';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from "axios";

export default function Dashboard() {
    const [perfData, setPerfData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock data - replace with actual API call
    useEffect(() => {
        // Simulating API call to fetch performance history data
        const fetchData = async () => {
        try {
            // Replace this with your actual API endpoint
            // const response = await fetch('/api/performance-history');
            // const data = await response.json();
            
            // Mock data based on your PerfHist structure
            const resp = await axios.get("http://localhost:4440/getPerfHist")
            console.log(resp)
            let data = resp.data
            // Process the data
            const processedData = data.map(entry => {
                const approvedCount = entry.approvedIds.length;
                const rejectedCount = entry.rejectedIds.length;
                const totalCount = approvedCount + rejectedCount;
                
                return {
                    id: entry.id,
                    batch: `Batch ${entry.id}`,
                    approvalPercentage: entry.approvalPercentage*100,
                    approvedCount,
                    rejectedCount,
                    totalCount
                };
            });
            
            setPerfData(processedData);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch performance data');
            setLoading(false);
            console.error('Error fetching performance data:', err);
        }
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-center p-8">Loading performance data...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    
    return(
    <header className="App-header" style={{alignContent:'center'}}>
        <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Model Performance History</h1>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Latest Approval Rate</h3>
          <p className="text-3xl font-bold text-blue-700">{perfData[perfData.length - 1]?.approvalPercentage.toFixed(1)}%</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Total Approved</h3>
          <p className="text-3xl font-bold text-green-700">
            {perfData.reduce((sum, entry) => sum + entry.approvedCount, 0)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Total Rejected</h3>
          <p className="text-3xl font-bold text-red-700">
            {perfData.reduce((sum, entry) => sum + entry.rejectedCount, 0)}
          </p>
        </div>
      </div>
      
      {/* Performance Trend Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Approval Rate Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis domain={[0, 100]} label={{ value: 'Approval %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Approval Rate']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="approvalPercentage" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 6 }} 
                activeDot={{ r: 8 }}
                name="Approval Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Batch Details Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Batch Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {perfData.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Batch {entry.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-white ${entry.approvalPercentage > 75 ? 'bg-green-500' : entry.approvalPercentage > 65 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {entry.approvalPercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.approvedCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.rejectedCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.totalCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </header>
    )
}
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../lib/api';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [distribution, setDistribution] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, distRes, perfRes] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/analytics/distribution'),
          api.get('/analytics/performance')
        ]);
        setStats(statsRes.data);
        setDistribution(distRes.data);
        setPerformance(perfRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pieOption = {
    title: { text: 'Task Distribution', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: 'Tasks',
        type: 'pie',
        radius: '50%',
        data: distribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const barOption = {
    title: { text: 'Team Performance (Completed)', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: performance.map(p => p.name) },
    yAxis: { type: 'value' },
    series: [
      {
        data: performance.map(p => p.completed),
        type: 'bar',
        itemStyle: { color: '#3b82f6' }
      }
    ]
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTasks}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <SafeIcon icon={FiIcons.FiLayers} className="h-6 w-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedTasks}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <SafeIcon icon={FiIcons.FiCheckCircle} className="h-6 w-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingTasks}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <SafeIcon icon={FiIcons.FiClock} className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <ReactECharts option={pieOption} style={{ height: '350px' }} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <ReactECharts option={barOption} style={{ height: '350px' }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
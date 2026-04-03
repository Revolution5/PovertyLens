// PovertyLens Admin Dashboard
// Created by Marisol Morales for Work Review 3

"use client"
import React, { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider'; // Marisol's ThemeProvider - provides isDark via theme === 'dark'
import { Users, Heart, FileText, Gamepad2, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ============== Mock data for PovertyLens metrics ==============
const userGrowthData = [
  { month: 'Jan', users: 450, stories: 120 },
  { month: 'Feb', users: 680, stories: 185 },
  { month: 'Mar', users: 920, stories: 250 },
  { month: 'Apr', users: 1240, stories: 340 },
  { month: 'May', users: 1680, stories: 480 },
  { month: 'Jun', users: 2341, stories: 650 },
];

const donationData = [
  { organization: 'UNICEF', amount: 12500 },
  { organization: 'Red Cross', amount: 9800 },
  { organization: 'World Food', amount: 8200 },
  { organization: 'Save Children', amount: 6500 },
  { organization: 'Oxfam', amount: 5100 },
];

const riceData = [
  { week: 'Week 1', grains: 12500, players: 145 },
  { week: 'Week 2', grains: 18200, players: 198 },
  { week: 'Week 3', grains: 24100, players: 256 },
  { week: 'Week 4', grains: 31500, players: 312 },
];

// ============== End mock data ==============

// ============== Stat Card ==============
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-xl p-6 transition-all duration-200"
      style={{
        backgroundColor: 'var(--background)',
        border: `1px solid ${hovered ? color + '60' : 'var(--color-gray-light)'}`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 24px ${color}20` : 'var(--shadow-sm)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            backgroundColor: trend === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: trend === 'up' ? '#22c55e' : '#ef4444',
          }}
        >
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--color-gray)' }}>{title}</p>
      <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
    </div>
  );
}

// ============== Chart Card wrapper ==============
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: 'var(--background)',
        border: '1px solid var(--color-gray-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ============== Admin Dashboard Page ==============
export default function AdminDashboardPage() {
  const { theme } = useTheme(); // Uses Marisol's ThemeProvider — no MutationObserver needed
  const isDark = theme === 'dark';

  // Recharts styles that adapt to dark/light mode
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const axisColor = isDark ? 'var(--color-gray)' : '#888';
  const tooltipStyle = {
    backgroundColor: 'var(--background)',
    border: '1px solid var(--color-gray-light)',
    borderRadius: '8px',
    color: 'var(--foreground)',
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                Admin Dashboard
            </h1>
            <p className="text-base" style={{ color: 'var(--color-gray)' }}>
                Monitor PovertyLens platform impact and engagement
            </p>
        </div>
    </div>

          {/* Live indicator */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: 'rgba(140, 228, 255, 0.1)',
              border: '1px solid rgba(140, 228, 255, 0.3)',
              color: '#8CE4FF',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#8CE4FF] animate-pulse" />
            Live Data
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Users"    value="2,341"   change="+38%" trend="up" icon={Users}    color="#8CE4FF" />
          <StatCard title="Stories Shared" value="650"     change="+35%" trend="up" icon={FileText} color="#FEEE91" />
          <StatCard title="Rice Donated"   value="86.3K"   change="+42%" trend="up" icon={Gamepad2} color="#FFA239" />
          <StatCard title="Donations Made" value="$42,100" change="+28%" trend="up" icon={Heart}    color="#FF5656" />
        </div>

        {/* ── Two column charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="User Growth & Stories">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left"  stroke={axisColor} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke={axisColor} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line yAxisId="left"  type="monotone" dataKey="users"   stroke="#8CE4FF" strokeWidth={2.5} name="Users"   dot={{ fill: '#8CE4FF', r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="stories" stroke="#FFA239" strokeWidth={2.5} name="Stories" dot={{ fill: '#FFA239', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Donations by Organization">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="organization" stroke={axisColor} tick={{ fontSize: 11 }} angle={-12} textAnchor="end" height={60} />
                <YAxis stroke={axisColor} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Donations']} />
                <Bar dataKey="amount" fill="#FF5656" name="Donations ($)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── FreeRice Activity ── */}
        <ChartCard title="FreeRice Activity">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="week" stroke={axisColor} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left"  stroke={axisColor} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" stroke={axisColor} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar yAxisId="left"  dataKey="grains"  fill="#FFA239" name="Rice Grains"    radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="players" fill="#8CE4FF" name="Active Players" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}
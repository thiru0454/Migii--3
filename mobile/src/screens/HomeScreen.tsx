import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  ChevronRight
} from 'lucide-react-native';
import { fetchDashboardStats } from '../services/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <View className="p-4 bg-white rounded-lg shadow-sm mb-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-medium text-gray-600">{title}</Text>
          <Text className="mt-2 text-2xl font-semibold text-gray-900">{value}</Text>
          {trend && (
            <Text className={`mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </Text>
          )}
        </View>
        <View className="p-3 bg-indigo-100 rounded-full">
          {icon}
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <View className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
          <Text className="text-gray-600">Welcome back, Admin</Text>
        </View>

        {/* Stats Grid */}
        <View className="space-y-4">
          <StatCard
            title="Total Workers"
            value={stats?.totalWorkers || 0}
            icon={<Users size={24} color="#4F46E5" />}
            trend={5}
          />
          <StatCard
            title="Active Locations"
            value={stats?.activeLocations || 0}
            icon={<MapPin size={24} color="#4F46E5" />}
            trend={2}
          />
          <StatCard
            title="Alerts"
            value={stats?.alerts || 0}
            icon={<AlertTriangle size={24} color="#4F46E5" />}
            trend={-3}
          />
          <StatCard
            title="Job Placements"
            value={stats?.jobPlacements || 0}
            icon={<TrendingUp size={24} color="#4F46E5" />}
            trend={8}
          />
        </View>

        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          <View className="space-y-2">
            <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-lg">
              <View className="flex-row items-center">
                <View className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <Users size={20} color="#4F46E5" />
                </View>
                <Text className="text-gray-900">Add New Worker</Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-lg">
              <View className="flex-row items-center">
                <View className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <MapPin size={20} color="#4F46E5" />
                </View>
                <Text className="text-gray-900">View Locations</Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-lg">
              <View className="flex-row items-center">
                <View className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <AlertTriangle size={20} color="#4F46E5" />
                </View>
                <Text className="text-gray-900">View Alerts</Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 
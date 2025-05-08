import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MapPin, Phone, Mail } from 'lucide-react-native';
import { fetchWorkers } from '../services/api';

interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function WorkersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: workers, isLoading, refetch } = useQuery({
    queryKey: ['workers'],
    queryFn: fetchWorkers
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredWorkers = workers?.filter(worker => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.phone.includes(searchQuery) ||
    worker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Worker['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderWorkerItem = ({ item }: { item: Worker }) => (
    <TouchableOpacity className="bg-white p-4 rounded-lg mb-2 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
          <View className="flex-row items-center mt-1">
            <Phone size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">{item.phone}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Mail size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">{item.email}</Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-medium capitalize">{item.status}</Text>
        </View>
      </View>
      <View className="flex-row items-center mt-3">
        <MapPin size={14} color="#4F46E5" />
        <Text className="text-sm text-indigo-600 ml-1">View Location</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <View className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="p-4 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Workers</Text>
        <Text className="text-gray-600">Manage your workforce</Text>
      </View>

      {/* Search and Filter */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="Search workers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="ml-2 p-2 bg-gray-100 rounded-lg">
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Worker List */}
      <FlatList
        data={filteredWorkers}
        renderItem={renderWorkerItem}
        keyExtractor={item => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">No workers found</Text>
          </View>
        }
      />

      {/* Add Worker Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-indigo-600 p-4 rounded-full shadow-lg">
        <Text className="text-white font-semibold">+</Text>
      </TouchableOpacity>
    </View>
  );
} 
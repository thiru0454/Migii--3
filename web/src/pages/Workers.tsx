
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  TextInput,
  Select,
  SelectItem,
} from '@tremor/react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../src/contexts/LanguageContext';

// Mock data - replace with actual API calls
const fetchWorkers = async () => {
  return {
    workers: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        status: 'active',
        location: 'New York',
        role: 'Field Worker',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1 234 567 8901',
        status: 'inactive',
        location: 'Los Angeles',
        role: 'Supervisor',
      },
      // Add more mock data as needed
    ],
  };
};

const statusColors = {
  active: 'green',
  inactive: 'red',
  pending: 'yellow',
};

export default function Workers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: fetchWorkers,
  });

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  const filteredWorkers = data.workers.filter((worker) => {
    const matchesSearch = worker.name.toLowerCase().includes(search.toLowerCase()) ||
      worker.email.toLowerCase().includes(search.toLowerCase()) ||
      worker.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <Title>{t('workers')}</Title>
        <Button
          icon={Plus}
          variant="primary"
          onClick={() => {/* Handle add worker */}}
        >
          Add {t('workers')}
        </Button>
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex-1 max-w-sm">
            <TextInput
              icon={Search}
              placeholder={`${t('search')} ${t('workers')}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectItem value="all">All {t('status')}</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </Select>
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t('name')}</TableHeaderCell>
              <TableHeaderCell>{t('email')}</TableHeaderCell>
              <TableHeaderCell>{t('phone')}</TableHeaderCell>
              <TableHeaderCell>{t('status')}</TableHeaderCell>
              <TableHeaderCell>{t('location')}</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>{t('actions')}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell>{worker.name}</TableCell>
                <TableCell>{worker.email}</TableCell>
                <TableCell>{worker.phone}</TableCell>
                <TableCell>
                  <Badge color={statusColors[worker.status]}>
                    {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{worker.location}</TableCell>
                <TableCell>{worker.role}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      variant="secondary"
                      icon={Edit2}
                      onClick={() => {/* Handle edit */}}
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      size="xs"
                      variant="secondary"
                      color="red"
                      icon={Trash2}
                      onClick={() => {/* Handle delete */}}
                    >
                      {t('delete')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

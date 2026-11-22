import React, { useState } from 'react';
import { Users, Mail, Shield, User } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Pagination } from '../../components/common/Pagination';
import { useAdminUsers } from '../../hooks/api/useUser';
import { formatDate } from '../../utils/formatDate';

export function AdminUsersPage() {
  const [page, setPage] = useState(0);

  const { data: usersData, isLoading } = useAdminUsers({ page, size: 10 });

  const users = usersData?.content || [];
  const totalPages = usersData?.totalPages || 1;

  const columns = [
    {
      key: 'fullName',
      header: 'User',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val || row.email} size="sm" />
          <div>
            <p className="font-semibold text-text-primary text-xs">{val || 'Unnamed User'}</p>
            <p className="text-[11px] text-text-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (val) => (
        <Badge variant={val === 'ADMIN' ? 'primary' : 'secondary'} size="sm">
          {val || 'CUSTOMER'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (val) => <span className="text-xs text-text-muted">{formatDate(val)}</span>,
    },
    {
      key: 'status',
      header: 'Account State',
      render: () => (
        <Badge variant="success" size="sm">
          Active
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">User Accounts</h1>
          <p className="text-xs text-text-muted mt-1">
            Registered accounts synchronized via Kafka UserRegisteredEvent
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyTitle="No users found"
      />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

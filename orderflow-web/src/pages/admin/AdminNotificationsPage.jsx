import React, { useState } from 'react';
import { Bell, Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { useAdminNotifications } from '../../hooks/api/useNotifications';
import { formatDate } from '../../utils/formatDate';

export function AdminNotificationsPage() {
  const [page, setPage] = useState(0);

  const { data: notifData, isLoading } = useAdminNotifications({ page, size: 10 });

  const notifications = notifData?.content || notifData || [];
  const totalPages = notifData?.totalPages || 1;

  const columns = [
    {
      key: 'id',
      header: 'Notification ID',
      width: '120px',
      render: (val) => <span className="font-mono text-xs text-text-muted">{val?.substring(0, 8)}...</span>,
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-text-primary text-xs">{val || 'Notification'}</span>
          <p className="text-[11px] font-mono text-text-muted">Template: {row.templateName || 'email'}</p>
        </div>
      ),
    },
    {
      key: 'recipientEmail',
      header: 'Recipient',
      render: (val, row) => <span className="text-xs text-text-secondary">{val || row.recipient}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (val) => <Badge variant="success" size="sm">{val || 'SENT'}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Sent At',
      render: (val) => <span className="text-xs text-text-muted">{formatDate(val)}</span>,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Notification Logs</h1>
          <p className="text-xs text-text-muted mt-1">
            Asynchronous event logs stored in MongoDB (:8087)
          </p>
        </div>

        <a
          href="http://localhost:8025"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-white/10 text-xs text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-primary" />
          <span>Mailpit SMTP Viewer (:8025)</span>
          <ExternalLink className="w-3 h-3 text-text-muted" />
        </a>
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        isLoading={isLoading}
        emptyTitle="No notification logs found"
      />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

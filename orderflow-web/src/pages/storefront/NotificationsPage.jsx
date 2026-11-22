import React from 'react';
import { Bell, Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotifications } from '../../hooks/api/useNotifications';
import { formatDate } from '../../utils/formatDate';

export function NotificationsPage() {
  const { data: notifData, isLoading } = useNotifications();
  const notifications = notifData?.content || notifData || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Notifications</h1>
          <p className="text-xs text-text-muted mt-1">
            Audit logs of asynchronous customer messages dispatched by Notification Service
          </p>
        </div>

        <a
          href="http://localhost:8025"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-white/10 text-xs text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-primary" />
          <span>Open Mailpit Web Inbox (:8025)</span>
          <ExternalLink className="w-3 h-3 text-text-muted" />
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When orders are placed, confirmed, or cancelled, transactional emails and notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <GlassCard
              key={notif.id}
              className="p-5 border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-text-primary">
                      {notif.subject || notif.title || 'System Notification'}
                    </h4>
                    <Badge variant="success" size="sm" icon={CheckCircle}>
                      {notif.status || 'SENT'}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Template: <span className="font-mono text-text-secondary">{notif.templateName || notif.type || 'email'}</span>
                    {' '}&bull;{' '}
                    Recipient: <span className="font-mono text-text-secondary">{notif.recipientEmail || notif.recipient}</span>
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-text-muted shrink-0">
                {formatDate(notif.createdAt)}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

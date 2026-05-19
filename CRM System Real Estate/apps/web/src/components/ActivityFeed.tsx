import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, UserCheck, Trash2, Plus, Clock } from 'lucide-react';
import api from '@/services/api';

interface ActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityTitle?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user: { name: string; role: string };
}

const ACTION_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  STATUS_CHANGED: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Status Changed',
    color: 'text-blue-500 bg-blue-500/10',
  },
  ASSIGNED: {
    icon: <UserCheck className="h-4 w-4" />,
    label: 'Reassigned',
    color: 'text-purple-500 bg-purple-500/10',
  },
  RECORD_DELETED: {
    icon: <Trash2 className="h-4 w-4" />,
    label: 'Deleted',
    color: 'text-red-500 bg-red-500/10',
  },
  CREATED: {
    icon: <Plus className="h-4 w-4" />,
    label: 'Created',
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  UPDATED: {
    icon: <Clock className="h-4 w-4" />,
    label: 'Updated',
    color: 'text-amber-500 bg-amber-500/10',
  },
};

interface Props {
  entityType: string;
  entityId: string;
}

const ActivityFeed: React.FC<Props> = ({ entityType, entityId }) => {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    api
      .get(`/activity/${entityType}/${entityId}`)
      .then((r) => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  if (loading) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground font-bold animate-pulse">
        Loading activity...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground/60 font-medium">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const meta = ACTION_META[log.action] ?? ACTION_META['UPDATED'];
        return (
          <div key={log.id} className="flex items-start gap-4">
            {/* Icon */}
            <div className={`mt-0.5 flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${meta.color}`}>
              {meta.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-foreground">
                  <span className="text-primary">{log.user?.name ?? 'System'}</span>{' '}
                  {meta.label.toLowerCase()}
                  {log.oldValue && log.newValue && (
                    <span className="text-muted-foreground font-medium">
                      {' '}
                      from <span className="font-black text-foreground">{log.oldValue}</span> →{' '}
                      <span className="font-black text-foreground">{log.newValue}</span>
                    </span>
                  )}
                </p>
                <span className="text-[10px] text-muted-foreground font-bold flex-shrink-0">
                  {new Date(log.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {log.entityTitle && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{log.entityTitle}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;

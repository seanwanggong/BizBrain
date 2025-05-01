import React from 'react';
import { Chip } from '@mui/material';
import { TaskStatus } from '@/types/workflow';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const statusConfig = {
  [TaskStatus.PENDING]: {
    label: '等待中',
    color: 'default' as const,
  },
  [TaskStatus.RUNNING]: {
    label: '运行中',
    color: 'primary' as const,
  },
  [TaskStatus.COMPLETED]: {
    label: '已完成',
    color: 'success' as const,
  },
  [TaskStatus.FAILED]: {
    label: '失败',
    color: 'error' as const,
  },
};

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ mr: 1 }}
    />
  );
};

export default TaskStatusBadge; 
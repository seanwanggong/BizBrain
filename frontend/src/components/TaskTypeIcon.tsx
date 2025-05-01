import React from 'react';
import {
  SmartToy as LLMIcon,
  Api as APIIcon,
  CallSplit as ConditionIcon,
  Loop as LoopIcon,
  AccountTree as ParallelIcon,
} from '@mui/icons-material';
import { TaskType } from '@/types/workflow';
import { SvgIconProps } from '@mui/material';

interface TaskTypeIconProps {
  type: TaskType;
  sx?: SvgIconProps['sx'];
}

const iconMap = {
  [TaskType.LLM]: LLMIcon,
  [TaskType.API]: APIIcon,
  [TaskType.CONDITION]: ConditionIcon,
  [TaskType.LOOP]: LoopIcon,
  [TaskType.PARALLEL]: ParallelIcon,
};

const TaskTypeIcon: React.FC<TaskTypeIconProps> = ({ type, sx }) => {
  const Icon = iconMap[type];
  return <Icon sx={sx} />;
};

export default TaskTypeIcon; 
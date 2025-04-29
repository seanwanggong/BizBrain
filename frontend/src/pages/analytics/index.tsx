import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Select, Typography, Table } from 'antd';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import styles from '@/styles/Analytics.module.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AnalyticsPage = () => {
  const [ setDateRange] = useState<[Date, Date] | null>(null);
  const [metricType, setMetricType] = useState('conversations');

  // 示例数据
  const lineChartData = [
    { name: '周一', conversations: 120, tasks: 15, success: 90 },
    { name: '周二', conversations: 160, tasks: 20, success: 85 },
    { name: '周三', conversations: 170, tasks: 25, success: 88 },
    { name: '周四', conversations: 180, tasks: 22, success: 92 },
    { name: '周五', conversations: 190, tasks: 30, success: 95 },
    { name: '周六', conversations: 150, tasks: 18, success: 87 },
    { name: '周日', conversations: 130, tasks: 16, success: 89 },
  ];

  const pieChartData = [
    { name: '客服咨询', value: 400 },
    { name: '数据分析', value: 300 },
    { name: '文档处理', value: 200 },
    { name: '其他任务', value: 100 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const tableData = [
    {
      key: '1',
      agent: '客服助手',
      conversations: 256,
      successRate: '95%',
      avgResponseTime: '2.5s',
    },
    {
      key: '2',
      agent: '数据分析师',
      conversations: 189,
      successRate: '92%',
      avgResponseTime: '3.1s',
    },
  ];

  const columns = [
    {
      title: 'Agent',
      dataIndex: 'agent',
      key: 'agent',
    },
    {
      title: '对话数',
      dataIndex: 'conversations',
      key: 'conversations',
      sorter: (a: any, b: any) => a.conversations - b.conversations,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
    },
    {
      title: '平均响应时间',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
    },
  ];

  return (
    <DashboardLayout title="数据分析">
      <div className={styles.analytics}>
        <Title level={2}>数据分析</Title>

        <div className={styles.filters}>
          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0]?.toDate()!, dates[1]?.toDate()!]);
              }
            }}
          />
          <Select
            defaultValue="conversations"
            style={{ width: 120 }}
            onChange={setMetricType}
            options={[
              { value: 'conversations', label: '对话数' },
              { value: 'tasks', label: '任务数' },
              { value: 'success', label: '成功率' },
            ]}
          />
        </div>

        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Card title="趋势分析">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={metricType}
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="任务分布">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Card title="Agent 性能统计" style={{ marginTop: '24px' }}>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage; 
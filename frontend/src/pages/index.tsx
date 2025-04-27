import React from 'react';
import { Typography, Row, Col, Card, Button, Space, Divider } from 'antd';
import {
  RobotOutlined,
  ApiOutlined,
  BookOutlined,
  ToolOutlined,
  RocketOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';
import Image from 'next/image';
import PublicLayout from '@/components/PublicLayout';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const features = [
    {
      icon: <RobotOutlined className={styles.featureIcon} />,
      title: '多Agent协作系统',
      description: '创建和管理AI Agents，实现智能协作和自动化工作流程',
      gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    },
    {
      icon: <ApiOutlined className={styles.featureIcon} />,
      title: '企业级工作流自动化',
      description: '可视化工作流设计器，内置模板库，支持任务调度和监控',
      gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
    },
    {
      icon: <BookOutlined className={styles.featureIcon} />,
      title: '知识库管理',
      description: '智能文档处理，向量数据库支持，构建企业知识图谱',
      gradient: 'linear-gradient(135deg, #13c2c2 0%, #08979c 100%)',
    },
    {
      icon: <ToolOutlined className={styles.featureIcon} />,
      title: '可扩展插件系统',
      description: '轻松集成自定义工具、API和第三方服务',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    },
    {
      icon: <RocketOutlined className={styles.featureIcon} />,
      title: '高性能架构',
      description: '分布式处理，实时同步，支持水平扩展',
      gradient: 'linear-gradient(135deg, #f5222d 0%, #cf1322 100%)',
    },
    {
      icon: <GlobalOutlined className={styles.featureIcon} />,
      title: '多语言支持',
      description: '支持中英文切换，为全球用户提供便捷服务',
      gradient: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroGradient} />
          <div className={styles.heroPattern} />
        </div>
        <Row justify="center" align="middle" className={styles.heroContent}>
          <Col xs={24} md={16} lg={12}>
            <div className={styles.heroLogo}>
              <Image src="/logo.png" alt="BizBrain Logo" width={80} height={80} />
            </div>
            <Title level={1} className={styles.title}>
              BizBrain
            </Title>
            <Title level={2} className={styles.subtitle}>
              AI Agent协作平台
            </Title>
            <Paragraph className={styles.description}>
              释放AI的潜力，实现企业智能自动化。BizBrain帮助您构建、管理和协调AI Agents，
              打造智能、高效的工作流程。
            </Paragraph>
            <Space size="large" className={styles.heroButtons}>
              <Link href="/register">
                <Button type="primary" size="large" className={styles.primaryButton}>
                  免费开始使用 <ArrowRightOutlined />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="large" className={styles.secondaryButton}>
                  查看文档
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Features Section */}
      <div className={styles.features}>
        <Title level={2} className={styles.sectionTitle}>
          核心功能
        </Title>
        <Row gutter={[32, 32]} justify="center">
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card 
                className={styles.featureCard} 
                bordered={false}
                style={{
                  '--card-gradient': feature.gradient,
                } as React.CSSProperties}
              >
                <div className={styles.featureIconWrapper} style={{ background: feature.gradient }}>
                  {feature.icon}
                </div>
                <Title level={3} className={styles.featureTitle}>
                  {feature.title}
                </Title>
                <Paragraph className={styles.featureDescription}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div className={styles.cta}>
        <div className={styles.ctaBackground}>
          <div className={styles.ctaGradient} />
          <div className={styles.ctaPattern} />
        </div>
        <Row justify="center" align="middle">
          <Col xs={24} md={16} lg={12} className={styles.ctaContent}>
            <Title level={2} className={styles.ctaTitle}>准备好开始了吗？</Title>
            <Paragraph className={styles.ctaDescription}>
              立即注册 BizBrain，体验 AI 为企业带来的革命性变化。
            </Paragraph>
            <Space size="large" className={styles.ctaButtons}>
              <Link href="/register">
                <Button type="primary" size="large" className={styles.primaryButton}>
                  免费注册 <ArrowRightOutlined />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="large" className={styles.secondaryButton}>
                  联系我们
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </div>
    </PublicLayout>
  );
};

export default HomePage; 
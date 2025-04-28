import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import Link from 'next/link';
import styles from '@/styles/Docs.module.css';

const { Title, Paragraph } = Typography;

const DocsPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div style={{ width: '100%' }}>
          <Title level={2} className={styles.title}>文档</Title>
          <Paragraph className={styles.description}>
            探索我们的产品文档、API 参考和教程，帮助您快速上手和使用 BizBrain。
          </Paragraph>

          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card className={styles.card} title="入门指南" bordered={false}>
                <Paragraph>
                  了解 BizBrain 的基本概念和核心功能，快速开始您的第一个项目。
                </Paragraph>
                <Link href="/docs/getting-started">
                  <Button type="link">开始阅读</Button>
                </Link>
              </Card>
            </Col>
            <Col span={8}>
              <Card className={styles.card} title="API 文档" bordered={false}>
                <Paragraph>
                  详细的 API 参考文档，包含所有接口的说明、参数和示例。
                </Paragraph>
                <Link href="/docs/api">
                  <Button type="link">查看 API</Button>
                </Link>
              </Card>
            </Col>
            <Col span={8}>
              <Card className={styles.card} title="最佳实践" bordered={false}>
                <Paragraph>
                  学习如何高效使用 BizBrain 的最佳实践和技巧。
                </Paragraph>
                <Link href="/docs/best-practices">
                  <Button type="link">了解更多</Button>
                </Link>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col span={8}>
              <Card title="使用指南" bordered={false}>
                <Paragraph>
                  详细的系统使用说明和最佳实践。
                </Paragraph>
                <Link href="/docs/guide">
                  <Button type="link">查看指南</Button>
                </Link>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="常见问题" bordered={false}>
                <Paragraph>
                  解答用户常见问题和疑难解答。
                </Paragraph>
                <Link href="/docs/faq">
                  <Button type="link">查看 FAQ</Button>
                </Link>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="更新日志" bordered={false}>
                <Paragraph>
                  系统版本更新记录和功能说明。
                </Paragraph>
                <Link href="/docs/changelog">
                  <Button type="link">查看更新</Button>
                </Link>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col span={8}>
              <Card title="联系我们" bordered={false}>
                <Paragraph>
                  获取技术支持或提供反馈建议。
                </Paragraph>
                <Link href="/docs/contact">
                  <Button type="link">联系我们</Button>
                </Link>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default DocsPage; 
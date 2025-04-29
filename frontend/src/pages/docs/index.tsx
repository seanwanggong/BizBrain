import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import Link from 'next/link';
import styles from '@/styles/Docs.module.css';

const { Title, Paragraph } = Typography;

interface DocSection {
  id: string;
  title: string;
  content: string;
}

interface DocsPageProps {
  sections: DocSection[];
}

const DocsPage = ({ sections }: DocsPageProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Title level={2}>文档中心</Title>
        <Paragraph className={styles.description}>
          欢迎使用 BizBrain 文档中心。在这里您可以找到所有关于如何使用和集成 BizBrain 的详细说明。
        </Paragraph>

        <Row gutter={[24, 24]}>
          {sections.map((section) => (
            <Col key={section.id} span={8}>
              <Link href={`/docs/${section.id}`} legacyBehavior>
                <a className={styles.cardLink}>
                  <Card 
                    className={styles.card} 
                    title={section.title} 
                    bordered={false}
                    hoverable
                  >
                    <Paragraph>
                      {section.content.split('\n')[0]}
                    </Paragraph>
                    <div className={styles.linkButton}>
                      查看详情
                    </div>
                  </Card>
                </a>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  // 这里应该是从你的 API 获取数据
  // 为了演示，我们使用静态数据
  const sections = [
    {
      id: 'getting-started',
      title: '快速开始',
      content: '了解如何快速开始使用 BizBrain。'
    },
    {
      id: 'api-reference',
      title: 'API 参考',
      content: '详细的 API 文档和示例。'
    },
    {
      id: 'best-practices',
      title: '最佳实践',
      content: '使用 BizBrain 的最佳实践指南。'
    }
  ];

  return {
    props: {
      sections,
    },
    // 每 1 小时重新生成一次
    revalidate: 3600,
  };
}

export default DocsPage; 
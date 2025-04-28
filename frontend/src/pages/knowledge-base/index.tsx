import React from 'react';
import { Typography, Card, Button } from 'antd';
import styles from '@/styles/KnowledgeBase.module.css';

const { Title, Paragraph } = Typography;

const KnowledgeBasePage = () => {
  return (
    <div className={styles.container}>
      <Title>知识库</Title>
      <Paragraph className={styles.description}>
        欢迎使用 BizBrain 知识库，在这里您可以找到所有关于知识库的详细说明。
      </Paragraph>

      <div className={styles.cardGrid}>
        <Card className={styles.card}>
          <div className={styles.cardIcon}>📄</div>
          <Title level={4}>文档管理</Title>
          <Paragraph>
            上传、管理和组织您的文档资源。
          </Paragraph>
          <Button type="link" className={styles.actionLink}>管理文档</Button>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardIcon}>💡</div>
          <Title level={4}>智能问答</Title>
          <Paragraph>
            基于知识库的智能问答系统。
          </Paragraph>
          <Button type="link" className={styles.actionLink}>开始问答</Button>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardIcon}>🔍</div>
          <Title level={4}>知识图谱</Title>
          <Paragraph>
            可视化展示知识关联和结构。
          </Paragraph>
          <Button type="link" className={styles.actionLink}>查看图谱</Button>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeBasePage; 
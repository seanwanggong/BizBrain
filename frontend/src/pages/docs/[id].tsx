import React from 'react';
import { Typography, Button, Anchor } from 'antd';
import { useRouter } from 'next/router';
import styles from '@/styles/DocDetail.module.css';

const { Title, Paragraph } = Typography;
const { Link } = Anchor;

interface DocDetailPageProps {
  doc: {
    id: string;
    title: string;
    content: string;
    sections?: {
      title: string;
      content: string;
    }[];
  };
}

type DocId = 'getting-started' | 'api-reference' | 'best-practices';

const DocDetailPage = ({ doc }: DocDetailPageProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/docs', undefined, { shallow: true });
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Anchor>
          <Link href="#overview" title="概述" />
          {doc.sections?.map((section, index) => (
            <Link key={index} href={`#section-${index}`} title={section.title} />
          ))}
        </Anchor>
      </div>
      <div className={styles.content}>
        <Button type="link" onClick={handleBack} className={styles.backButton}>
          ← 返回文档列表
        </Button>
        <Title level={2} id="overview">{doc.title}</Title>
        <Paragraph className={styles.intro}>
          {doc.content}
        </Paragraph>
        {doc.sections?.map((section, index) => (
          <div key={index} id={`section-${index}`} className={styles.section}>
            <Title level={3}>{section.title}</Title>
            <Paragraph>{section.content}</Paragraph>
          </div>
        ))}
      </div>
    </div>
  );
};

export async function getStaticPaths() {
  // 这里应该是从你的 API 获取所有文档的 ID
  // 为了演示，我们使用静态数据
  const paths = [
    { params: { id: 'getting-started' } },
    { params: { id: 'api-reference' } },
    { params: { id: 'best-practices' } }
  ];

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { id: DocId } }) {
  // 这里应该是从你的 API 获取文档详情
  // 为了演示，我们使用静态数据
  const docs = {
    'getting-started': {
      id: 'getting-started',
      title: '快速开始',
      content: '欢迎使用 BizBrain！本指南将帮助您快速上手并开始使用我们的平台。',
      sections: [
        {
          title: '注册账号',
          content: '首先，您需要注册一个 BizBrain 账号。访问我们的官网，点击"注册"按钮，填写必要信息即可完成注册。'
        },
        {
          title: '创建项目',
          content: '注册成功后，您可以创建您的第一个项目。点击"新建项目"，填写项目名称和描述，选择适合的模板。'
        },
        {
          title: '开始使用',
          content: '项目创建完成后，您可以开始使用各种功能。我们提供了详细的使用指南和示例，帮助您快速上手。'
        }
      ]
    },
    'api-reference': {
      id: 'api-reference',
      title: 'API 参考',
      content: 'BizBrain 提供了丰富的 API 接口，帮助您更好地集成和使用我们的服务。',
      sections: [
        {
          title: '认证',
          content: '所有 API 请求都需要进行认证。您需要在请求头中包含 API Key。'
        },
        {
          title: '接口列表',
          content: '我们提供了用户管理、项目管理、数据分析等多个接口，满足您的各种需求。'
        },
        {
          title: '错误处理',
          content: 'API 调用可能返回各种错误码，我们提供了详细的错误说明和处理建议。'
        }
      ]
    },
    'best-practices': {
      id: 'best-practices',
      title: '最佳实践',
      content: '以下是一些使用 BizBrain 的最佳实践建议，帮助您更好地利用我们的平台。',
      sections: [
        {
          title: '数据管理',
          content: '合理组织和管理您的数据，使用标签和分类功能，提高数据检索效率。'
        },
        {
          title: '性能优化',
          content: '优化您的查询和操作，减少不必要的 API 调用，提高系统性能。'
        },
        {
          title: '安全建议',
          content: '保护您的账号安全，定期更换密码，使用强密码，开启双重认证。'
        }
      ]
    }
  };

  return {
    props: {
      doc: docs[params.id],
    },
    // 每 1 小时重新生成一次
    revalidate: 3600,
  };
}

export default DocDetailPage; 
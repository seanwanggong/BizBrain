import React from 'react';
import { Modal, Tabs, Typography, message } from 'antd';
import { KnowledgeDocument } from '@/types/knowledge';
import ReactMarkdown from 'react-markdown';
import styles from './DocumentPreview.module.css';

const { Text } = Typography;

interface DocumentPreviewProps {
  document: KnowledgeDocument;
  visible: boolean;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  visible,
  onClose,
}) => {
  const renderContent = () => {
    switch (document.type) {
      case 'markdown':
        return (
          <div className={styles.markdownContent}>
            <ReactMarkdown>{document.content}</ReactMarkdown>
          </div>
        );
      case 'text':
        return (
          <div className={styles.textContent}>
            <pre>{document.content}</pre>
          </div>
        );
      case 'html':
        return (
          <div 
            className={styles.htmlContent}
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        );
      case 'pdf':
        return (
          <div className={styles.pdfContent}>
            <Text type="secondary">
              暂不支持PDF预览，请下载后查看
            </Text>
          </div>
        );
      default:
        return (
          <Text type="secondary">
            暂不支持此类型文件的预览
          </Text>
        );
    }
  };

  const items = [
    {
      key: 'content',
      label: '内容',
      children: renderContent(),
    },
    {
      key: 'metadata',
      label: '元数据',
      children: (
        <div className={styles.metadata}>
          {Object.entries(document.metadata).map(([key, value]) => (
            <div key={key} className={styles.metadataItem}>
              <Text strong>{key}:</Text>
              <Text>{value?.toString()}</Text>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={document.name}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      className={styles.previewModal}
    >
      <Tabs items={items} />
    </Modal>
  );
};

export default DocumentPreview; 
import React, { useState } from 'react';
import { Form, Input, Button, Space, Select, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { KnowledgeBaseFormData } from '@/types/knowledge';
import styles from './KnowledgeBaseForm.module.css';

interface KnowledgeBaseFormProps {
  initialValues?: Partial<KnowledgeBaseFormData>;
  onSubmit: (values: KnowledgeBaseFormData) => void;
  onCancel: () => void;
}

const KnowledgeBaseForm: React.FC<KnowledgeBaseFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<KnowledgeBaseFormData>();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleClose = (removedCategory: string) => {
    const categories = form.getFieldValue('categories') || [];
    form.setFieldsValue({
      categories: categories.filter((category: string) => category !== removedCategory),
    });
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue) {
      const categories = form.getFieldValue('categories') || [];
      if (!categories.includes(inputValue)) {
        form.setFieldsValue({
          categories: [...categories, inputValue],
        });
      }
    }
    setInputValue('');
    setInputVisible(false);
  };

  const renderCategories = () => {
    const categories = form.getFieldValue('categories') || [];
    return (
      <div className={styles.categories}>
        {categories.map((category: string) => (
          <Tag
            key={category}
            closable
            onClose={() => handleClose(category)}
          >
            {category}
          </Tag>
        ))}
        {inputVisible ? (
          <Input
            type="text"
            size="small"
            style={{ width: 100 }}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
          />
        ) : (
          <Tag onClick={showInput} style={{ borderStyle: 'dashed' }}>
            <PlusOutlined /> 添加分类
          </Tag>
        )}
      </div>
    );
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      className={styles.form}
    >
      <Form.Item
        name="name"
        label="知识库名称"
        rules={[{ required: true, message: '请输入知识库名称' }]}
      >
        <Input placeholder="输入知识库名称" />
      </Form.Item>

      <Form.Item
        name="description"
        label="描述"
        rules={[{ required: true, message: '请输入知识库描述' }]}
      >
        <Input.TextArea
          placeholder="描述知识库的用途和内容"
          rows={4}
          showCount
          maxLength={200}
        />
      </Form.Item>

      <Form.Item
        name="categories"
        label="分类"
        extra="为知识库添加分类，方便文档管理"
      >
        {renderCategories()}
      </Form.Item>

      <div className={styles.footer}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>
            {initialValues ? '更新' : '创建'}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default KnowledgeBaseForm; 
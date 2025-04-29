import React, { useState } from 'react';
import { Form, Input, Select, Button, Space, Card, Modal, Tooltip, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { FormField, FormSchema } from '@/types/workflow';
import styles from '@/styles/FormDesigner.module.css';

const { TextArea } = Input;
const { Option } = Select;

interface FormDesignerProps {
  onChange: (schema: FormSchema) => void;
  initialValue?: FormSchema;
}

const FIELD_TYPES = [
  { label: '单行文本', value: 'text' },
  { label: '多行文本', value: 'textarea' },
  { label: '数字', value: 'number' },
  { label: '单选', value: 'radio' },
  { label: '多选', value: 'checkbox' },
  { label: '下拉选择', value: 'select' },
  { label: '日期', value: 'date' },
  { label: '开关', value: 'switch' },
];

const FormDesigner: React.FC<FormDesignerProps> = ({ onChange, initialValue }) => {
  const [fields, setFields] = useState<FormField[]>(initialValue?.fields || []);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);
  const [optionsForm] = Form.useForm();

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${fields.length + 1}`,
      label: '',
      type: 'text',
      required: false,
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    onChange({ fields: newFields });
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    onChange({ fields: newFields });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const field = newFields[index];
    newFields.splice(index, 1);
    newFields.splice(newIndex, 0, field);
    setFields(newFields);
    onChange({ fields: newFields });
  };

  const handleFieldChange = (index: number, key: keyof FormField, value: any) => {
    const newFields = [...fields];
    newFields[index] = {
      ...newFields[index],
      [key]: value,
    };

    // 如果改变了字段类型，清空选项
    if (key === 'type' && !['radio', 'checkbox', 'select'].includes(value)) {
      delete newFields[index].options;
    }

    setFields(newFields);
    onChange({ fields: newFields });
  };

  const showOptionsModal = (index: number) => {
    setCurrentFieldIndex(index);
    optionsForm.setFieldsValue({
      options: fields[index].options || [{ label: '', value: '' }],
    });
    setOptionsModalVisible(true);
  };

  const handleOptionsSubmit = async () => {
    try {
      const values = await optionsForm.validateFields();
      if (currentFieldIndex !== null) {
        const newFields = [...fields];
        newFields[currentFieldIndex].options = values.options;
        setFields(newFields);
        onChange({ fields: newFields });
        setOptionsModalVisible(false);
      }
    } catch (error) {
      console.error('验证选项失败:', error);
    }
  };

  return (
    <div className={styles.formDesigner}>
      <div className={styles.toolbar}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddField}>
          添加字段
        </Button>
      </div>

      <div className={styles.fieldList}>
        {fields.map((field, index) => (
          <Card
            key={index}
            className={styles.fieldCard}
            actions={[
              <Tooltip key="up" title="上移">
                <Button
                  type="text"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => handleMoveField(index, 'up')}
                />
              </Tooltip>,
              <Tooltip key="down" title="下移">
                <Button
                  type="text"
                  icon={<ArrowDownOutlined />}
                  disabled={index === fields.length - 1}
                  onClick={() => handleMoveField(index, 'down')}
                />
              </Tooltip>,
              <Tooltip key="delete" title="删除">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveField(index)}
                />
              </Tooltip>,
            ]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item label="字段名称" required>
                <Input
                  value={field.label}
                  onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                  placeholder="请输入字段名称"
                />
              </Form.Item>

              <Form.Item label="字段标识" required>
                <Input
                  value={field.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  placeholder="请输入字段标识"
                />
              </Form.Item>

              <Form.Item label="字段类型" required>
                <Select
                  value={field.type}
                  onChange={(value) => handleFieldChange(index, 'type', value)}
                >
                  {FIELD_TYPES.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {['radio', 'checkbox', 'select'].includes(field.type) && (
                <Button type="dashed" block onClick={() => showOptionsModal(index)}>
                  配置选项
                </Button>
              )}

              <Form.Item label="必填">
                <Switch
                  checked={field.required}
                  onChange={(checked) => handleFieldChange(index, 'required', checked)}
                />
              </Form.Item>

              <Form.Item label="占位提示">
                <Input
                  value={field.placeholder}
                  onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                  placeholder="请输入占位提示"
                />
              </Form.Item>
            </Space>
          </Card>
        ))}
      </div>

      <Modal
        title="配置选项"
        open={optionsModalVisible}
        onOk={handleOptionsSubmit}
        onCancel={() => setOptionsModalVisible(false)}
        width={600}
      >
        <Form form={optionsForm} layout="vertical">
          <Form.List name="options">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Space key={field.key} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, 'label']}
                      rules={[{ required: true, message: '请输入选项标签' }]}
                    >
                      <Input placeholder="选项标签" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'value']}
                      rules={[{ required: true, message: '请输入选项值' }]}
                    >
                      <Input placeholder="选项值" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <DeleteOutlined onClick={() => remove(field.name)} />
                    )}
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加选项
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default FormDesigner; 
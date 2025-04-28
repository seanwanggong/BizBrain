import React from 'react';
import { Form, Button, Card, Typography, Input, Select, DatePicker, InputNumber, Switch, Radio, Checkbox } from 'antd';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface FormExecutorProps {
  formConfig: {
    title: string;
    description?: string;
    formSchema: {
      fields: Array<{
        name: string;
        label: string;
        type: string;
        required?: boolean;
        options?: Array<{ label: string; value: any }>;
        placeholder?: string;
      }>;
    };
  };
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const FormExecutor: React.FC<FormExecutorProps> = ({
  formConfig,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const renderFormItem = (field: any) => {
    const commonProps = {
      placeholder: field.placeholder || `请输入${field.label}`,
    };

    switch (field.type) {
      case 'text':
        return <Input {...commonProps} />;
      case 'textarea':
        return <TextArea rows={4} {...commonProps} />;
      case 'number':
        return <InputNumber style={{ width: '100%' }} {...commonProps} />;
      case 'select':
        return (
          <Select {...commonProps} options={field.options} />
        );
      case 'date':
        return <DatePicker style={{ width: '100%' }} {...commonProps} />;
      case 'switch':
        return <Switch />;
      case 'radio':
        return (
          <Radio.Group options={field.options} />
        );
      case 'checkbox':
        return (
          <Checkbox.Group options={field.options} />
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Title level={3}>{formConfig.title}</Title>
      {formConfig.description && (
        <Paragraph style={{ marginBottom: 24 }}>{formConfig.description}</Paragraph>
      )}
      
      <Form
        form={form}
        layout="vertical"
      >
        {formConfig.formSchema.fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[
              {
                required: field.required,
                message: `请${field.type === 'select' ? '选择' : '输入'}${field.label}`,
              },
            ]}
          >
            {renderFormItem(field)}
          </Form.Item>
        ))}
      </Form>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ marginRight: 16 }}>
          取消
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
      </div>
    </Card>
  );
};

export default FormExecutor; 
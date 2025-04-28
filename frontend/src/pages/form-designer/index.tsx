import React, { useState } from 'react';
import { Card, Button, message } from 'antd';
import FormDesigner from '@/components/FormDesigner';
import styles from './index.module.css';

const FormDesignerPage: React.FC = () => {
  const [formSchema, setFormSchema] = useState<any>(null);

  const handleSchemaChange = (schema: any) => {
    setFormSchema(schema);
  };

  const handleSave = () => {
    if (!formSchema) {
      message.warning('请先设计表单');
      return;
    }
    console.log('保存表单配置:', formSchema);
    message.success('保存成功');
  };

  return (
    <div className={styles.container}>
      <Card 
        className={styles.card}
        title="表单设计器" 
        extra={<Button type="primary" onClick={handleSave}>保存表单</Button>}
      >
        <div className={styles.designer}>
          <FormDesigner onChange={handleSchemaChange} />
        </div>
      </Card>
    </div>
  );
};

export default FormDesignerPage; 
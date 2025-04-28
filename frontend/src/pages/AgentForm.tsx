<Form.Item label="模型参数">
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item name="model" label="模型">
        <Select>
          <Select.Option value="gpt-4">GPT-4</Select.Option>
          <Select.Option value="gpt-3.5-turbo">GPT-3.5-Turbo</Select.Option>
        </Select>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="temperature" label="温度">
        <InputNumber min={0} max={1} step={0.1} />
      </Form.Item>
    </Col>
  </Row>
</Form.Item> 
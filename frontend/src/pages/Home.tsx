import React from 'react';
import styles from '@/styles/Home.module.css';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>欢迎使用 BizBrain</h1>
        <p>智能化的业务流程管理平台</p>
      </div>
    </div>
  );
};

export default Home; 
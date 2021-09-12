import React from 'react';
import styles from './index.css';

export default function Page() {
  return (
    <div className={ 'bg-purple-50 flex flex-col h-100vh' }>
      <h1 className={styles.title}>WindiCSS Umi example</h1>
      <div>
        <p className={ 'text-gray-600 text-2xl font-bold max-w-3xl p-10'  }>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi culpa dicta in laboriosam molestiae nesciunt pariatur perferendis perspiciatis placeat, porro quaerat qui quis rem similique sint veniam veritatis. Accusamus, sequi?</p>
      </div>
    </div>
  );
}

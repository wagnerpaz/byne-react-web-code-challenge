import React from 'react';

import styles from './Button1.module.scss';

const Button1: React.FC<Props> = ({ style, children, fullWidth, onClick }) => {
   return (
      <button
         className={styles.btn}
         style={{ ...(fullWidth ? { width: '100%' } : undefined), ...style }}
         onClick={onClick}
      >
         {children}
      </button>
   );
};

interface Props {
   style?: React.CSSProperties | undefined;
   fullWidth?: boolean;
   onClick: (e: React.MouseEvent | undefined) => void;
}

export default Button1;

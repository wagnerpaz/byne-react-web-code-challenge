import React from 'react';

import styles from './Modal.module.scss';

const Modal: React.FC<Props> = ({ children, onClose }) => {
   return (
      <div className={styles.background} onClick={onClose}>
         <div
            className={styles.modal}
            onClick={(e) => {
               e.stopPropagation();
            }}
         >
            {children}
         </div>
      </div>
   );
};

interface Props {
   onClose: () => void;
}

export default Modal;

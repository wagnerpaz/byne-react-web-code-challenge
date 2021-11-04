import React, { useEffect, useState } from 'react';
import { StockData } from '../App';

import styles from './AddStockModal.module.scss';
import Button1 from './Button1';
import Modal from './Modal';

const AddStockModal: React.FC<Props> = ({
   stocksData,
   onStockAdd,
   onClose,
}): React.ReactElement => {
   const [selectedStock, setSelectedStock] = useState<string>();

   useEffect(() => {
      if (!selectedStock) setSelectedStock(stocksData[0].symbol);
   }, [stocksData]);

   return (
      <Modal onClose={onClose}>
         <span className={styles.title}>Add Stock</span>
         <select
            value={selectedStock}
            className={styles.selectStock}
            onChange={(e) => {
               console.log(e.target.value);
               setSelectedStock(e.target.value);
            }}
         >
            {stocksData.map((sd) => (
               <option key={sd.symbol} value={sd.symbol}>
                  {sd.symbol}
               </option>
            ))}
         </select>
         <Button1
            fullWidth
            onClick={(e) => {
               onStockAdd(e, selectedStock as string);
               onClose();
            }}
         >
            Add
         </Button1>
      </Modal>
   );
};

interface Props {
   stocksData: StockData[];
   onStockAdd: (e: React.MouseEvent | undefined, symbol: string) => void;
   onClose: () => void;
}

export default AddStockModal;

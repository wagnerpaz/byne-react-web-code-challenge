import React, { useState } from 'react';
import { VictoryLine } from 'victory';

import styles from './StockRealtimeDisplay.module.scss';
import { StockData } from '../App';
import Button1 from './Button1';

const StockRealtimeDisplay: React.FC<Props> = ({
   stockData,
   onRemoveClick,
}): React.ReactElement => {
   const [mouseOver, setMouseOver] = useState(false);
   return (
      <div
         className={styles.stock}
         onMouseOver={() => setMouseOver(true)}
         onMouseLeave={() => setMouseOver(false)}
      >
         <div className={styles.stockDesc}>
            <span className={styles.stockDescSymbol}>{stockData.symbol}</span>
            <span
               className={[styles.stockDescInfo, styles.stockDescInfo1].join(
                  ' '
               )}
            >
               {stockData.companyName}
            </span>
            <span
               className={[styles.stockDescInfo, styles.stockDescInfo2].join(
                  ' '
               )}
            >
               {stockData.catchPhrase}
            </span>
         </div>
         <div className={styles.stockValues}>
            <div className={styles.stockValuesPrice}>
               <span className={styles.stockValuesPriceCurrent}>
                  {Math.round(stockData.currentPrice * 100) / 100}
               </span>
               <span className={styles.stockValuesPriceBase}>
                  {Math.round(stockData.basePrice * 100) / 100}
               </span>
            </div>
            <span
               className={[
                  styles.stockValuesChangePercentage,
                  stockData.changePercentage >= 0
                     ? styles.stockValuesChangePercentage_positive
                     : styles.stockValuesChangePercentage_negative,
               ].join(' ')}
            >
               {Math.round(stockData.changePercentage * 100) / 100}%
            </span>
            <div className={styles.stockValuesPeak}>
               <span>Min: {Math.round(stockData.minPrice * 100) / 100}</span>
               <span>Max: {Math.round(stockData.maxPrice * 100) / 100}</span>
            </div>
            <div className={styles.stockValuesChart}>
               <VictoryLine
                  data={stockData.history.map((h) => -h)}
                  height={50}
               />
            </div>
            <div style={{ flex: 1 }}></div>
            <div className={styles.removeBtnContainer}>
               <Button1
                  fullWidth
                  style={!mouseOver ? { display: 'none' } : undefined}
                  onClick={(e) => onRemoveClick(e, stockData)}
               >
                  Remove
               </Button1>
            </div>
         </div>
      </div>
   );
};

interface Props {
   stockData: StockData;
   onRemoveClick: (
      e: React.MouseEvent | undefined,
      stockData: StockData
   ) => void;
}

export default StockRealtimeDisplay;

import React, { useCallback, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { throttle } from 'lodash';

import './base.scss';
import styles from './App.module.scss';
import StockRealtimeDisplay from './components/StockRealtimeDisplay';
import Button1 from './components/Button1';
import AddStockModal from './components/AddStockModal';
import Modal from './components/Modal';

const RECONNECT_INTERVAL = 5000;

function App(): React.ReactElement {
   const [stocksData, setStocksData] = useState<StockData[]>([]);
   const [subscribedStocks, setSubscribeStocks] = useState<string[]>([
      'IET',
      'ZHT',
   ]);
   const [message, setMessage] = useState('');
   const [updatesThrottle, setUpdatesThrottle] = useState(1000);
   const [addStockVisible, setAddStockVisible] = useState(false);
   const [error, setError] = useState(false);
   const [loading, setLoading] = useState(true);

   const socketUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';

   const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl, {
      retryOnError: true,
      reconnectInterval: RECONNECT_INTERVAL,
      shouldReconnect: () => true,
      onError: (e) => {
         console.log('error', e);
         setError(true);
         setTimeout(() => {
            setLoading(true);
            setError(false);
         }, RECONNECT_INTERVAL);
      },
   });

   const handleUpdate = useCallback(
      throttle(
         (stockSymbol, stockPrice) =>
            setStocksData((sd) =>
               sd.map((i) => {
                  const roundedBasePrice = Math.round(i.basePrice * 100) / 100;
                  const roundedStockPrice = Math.round(stockPrice * 100) / 100;
                  const changePercentage =
                     ((roundedBasePrice > roundedStockPrice ? -1 : 1) *
                        ((Math.max(roundedBasePrice, roundedStockPrice) -
                           Math.min(roundedBasePrice, roundedStockPrice)) *
                           100)) /
                     Math.max(roundedBasePrice, roundedStockPrice);
                  const history = [...i.history];
                  history.shift();
                  history.push(roundedStockPrice);
                  return i.symbol === stockSymbol
                     ? {
                          ...i,
                          currentPrice: stockPrice,
                          changePercentage,
                          minPrice:
                             stockPrice < i.minPrice ? stockPrice : i.minPrice,
                          maxPrice:
                             stockPrice > i.maxPrice ? stockPrice : i.maxPrice,
                          history,
                       }
                     : i;
               })
            ),
         updatesThrottle
      ),
      [updatesThrottle]
   );

   const onAddStockClick = () => {
      setAddStockVisible(true);
   };

   const onStockModalClose = () => {
      setAddStockVisible(false);
   };

   const onStockAdd = (e: React.MouseEvent | undefined, symbol: string) => {
      console.log(symbol);
      setSubscribeStocks((ss) => [...ss, symbol]);
   };

   const onRemoveStockClick = (
      e: React.MouseEvent | undefined,
      stock: StockData
   ): void => {
      if (confirm(`Are you sure you want to remove stock '${stock.symbol}?'`))
         setSubscribeStocks((ss) => ss.filter((s) => s !== stock.symbol));
   };

   useEffect(() => {
      if (!lastJsonMessage) return;

      const e = lastJsonMessage as Event;

      const events = {
         [Events.CONNECTED]: function () {
            setLoading(false);
            const connectedEvent = e as ConnectedEvent;
            setMessage(connectedEvent.message);
            setStocksData(
               connectedEvent.stocksData.map((sd) => ({
                  ...sd,
                  currentPrice: sd.basePrice,
                  changePercentage: 0,
                  minPrice: sd.basePrice,
                  maxPrice: sd.basePrice,
                  history: new Array(50).fill(sd.basePrice, 0),
               }))
            );
         },
         [Events.STOCKS_UPDATE]: function () {
            const stocksUpdateEvent = e as StocksUpdateEvent;
            const stockSymbol = Object.keys(stocksUpdateEvent.stocks)[0];
            const stockPrice = stocksUpdateEvent.stocks[stockSymbol];
            handleUpdate(stockSymbol, stockPrice);
         },
      };
      events[e.event] && events[e.event]();
   }, [lastJsonMessage]);

   useEffect(() => {
      if ((lastJsonMessage as Event)?.event === 'connected') {
         sendJsonMessage({ event: 'subscribe', stocks: subscribedStocks });
         return () => {
            sendJsonMessage({ event: 'unsubscribe', stocks: subscribedStocks });
         };
      }
   }, [sendJsonMessage, lastJsonMessage, subscribedStocks]);

   if (error) {
      return (
         <div className={styles.errorModal}>
            <Modal onClose={() => null}>
               An error ocurred while trying to connect to the websocket at
               &quot;
               {socketUrl}&quot;
            </Modal>
         </div>
      );
   }

   if (loading) {
      return (
         <div className={styles.loadingModal}>
            <Modal onClose={() => null}>
               Connecting to &quot;{socketUrl}&quot;...
            </Modal>
         </div>
      );
   }

   return (
      <div className={styles.background}>
         <div className={styles.centered}>
            <span className={styles.message}>{message}</span>
         </div>
         <div className={[styles.centered, styles.throttle].join(' ')}>
            <span>Updates throttle (milliseconds): </span>
            <input
               type='number'
               value={updatesThrottle}
               onChange={(e) => setUpdatesThrottle(+e.target.value)}
            />
            <span>* Set to 0 for realtime updates</span>
         </div>
         {stocksData
            .filter((sd) => subscribedStocks.includes(sd.symbol))
            .map((sd) => (
               <StockRealtimeDisplay
                  key={sd.symbol}
                  stockData={sd}
                  onRemoveClick={onRemoveStockClick}
               />
            ))}
         <div className={styles.centered}>
            <Button1 onClick={onAddStockClick}>Add stock</Button1>
         </div>
         {addStockVisible && (
            <AddStockModal
               stocksData={stocksData.filter(
                  (sd) => !subscribedStocks.includes(sd.symbol)
               )}
               onStockAdd={onStockAdd}
               onClose={onStockModalClose}
            />
         )}
      </div>
   );
}

export enum Events {
   CONNECTED = 'connected',
   STOCKS_UPDATE = 'stocks-update',
}

export interface Event {
   event: Events;
}

export interface ConnectedEvent extends Event {
   message: string;
   supportedSymbols: string[];
   stocksData: StockData[];
}

export interface StocksUpdateEvent extends Event {
   stocks: Record<string, number>;
}

export interface StockData {
   symbol: string;
   companyName: string;
   catchPhrase: string;
   basePrice: number;
   currentPrice: number;
   changePercentage: number;
   minPrice: number;
   maxPrice: number;
   history: number[];
}

export default App;

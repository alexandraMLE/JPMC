/** this file is responsible for processing raw stock data from the server 
 * before throwing to the graph component to render */

import {ServerRespond} from './DataStreamer';

/** export interface Row needs to match schema from Graph.tsx */
export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  upper_bound: number,
  lower_bound: number,
  timestamp: Date,
  trigger_alert: number | undefined,
}

export class DataManipulator {
  /** serverRespond[] accessed as an array 
   * where the first element [0-index] is stock ABC and the second element [1-index] is about stock DEF 
   * coding fact: check the details of things that need to match, i.e. Row[] vs Row { */
  static generateRow(serverRespond: ServerRespond[] ): Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    const upper_bound = 1 + 0.05;
    const lower_bound = 1 - 0.05;   /** observe 10% movement, more conservative alerting behaviour,
     compared to less, say 5%, more aggressive alerting behaviour */
    /** note how the return is a single row object instead of an array of row objects, coincides with no column-pivots */
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
        serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upper_bound,
      lower_bound: lower_bound,
      /** trigger_alert will go when ratio exceeds upper bound and is below lower bound, 
       * if ratio is within will not return a value */
      trigger_alert: (ratio > upper_bound || ratio < lower_bound) ? ratio : undefined,
    };
  }
}

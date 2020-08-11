import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      /** price_ABC and price_DEF are vital to getting the ratio, but will not be graphed */
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      upper_bound: 'float',
      lower_bound: 'float',
      timestamp:'date',
      /** trigger_alert: the moment when upper and lower bounds are crossed */
      trigger_alert: 'float'
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');  /** y_line describes a continuous line */
      elem.setAttribute('row-pivots', '["timestamp"]');  /** x-axis, 
      note NO column-pivots defined because we want the ratio, not a seperation between the two stocks */
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        /** aggregates consolidates duplicated data points */
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        upper_bound: 'avg',
        lower_bound: 'avg',
        timestamp: 'distinct count',
        trigger_alert: 'avg'
      }));
    }
  }

  /** another component lifecycle method excuted whenever the component [the graph in this case] updates */
  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        /** telling the graph to update after new data from the DataManipulator.ts file 
         * which is responsible for processing raw data */
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;

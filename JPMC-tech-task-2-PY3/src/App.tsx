import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 * interfaces define what needs to be valid i.e. IState should always have valid data and showGraph
 */
interface IState {
  data: ServerRespond[],
  showGraph: boolean,
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property
      /** initally, do not want to show a graph, showGraph: false initial condition 
       * extends tells me this is an 'inheritance' with React Component as the parent base
       * super(props) [method] that calls the constructor of the parent class
       * constructos bind event handlers [this.state = {}] within 
       * if i find that i do not need a state or event handler, 
       *      then i should be using a functional component, not a class component
      */
      data: [],
      showGraph: false,
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   * renders graph when showGraph is true, i.e. when the user clicks start streaming
   */
  renderGraph() {
    if (this.state.showGraph) {
    return (<Graph data={this.state.data}/>)
    }
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
    /** x is the guard value; javascript has setInterval function to do things in intervals
     * with the guard value to make it continuous [can specify a period of time] that can be checked against for a stop
     */
    let x = 0
    const interval = setInterval(() => {
      /** DataStreamer.getData is an asynchronous process that gets data from the server,
       * then anything after the => is a callback function
      */
    DataStreamer.getData((serverResponds: ServerRespond[]) => {
      // Update the state by creating a new array of data that consists of
      // Previous data in the state and the new data from server
      /** keep in mind immutability [immutable objects cannot be changed]; 
       * the only place to assign the local state is in the constructor, 
       * anywhere else local state is assigned in setState() 
       * as soon as data comes back from server to requester, showGraph: true */
      this.setState({
        data: serverResponds,
        showGraph: true,
      });
    });
    x++;
    if (x > 1000) {
      clearInterval(interval);
    }
  }, 100);
}

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is click, our react app tries to request
            // new data from the server.
            // As part of your task, update the getDataFromServer() function
            // to keep requesting the data every 100ms until the app is closed
            // or the server does not return anymore data.
            onClick={() => {this.getDataFromServer()}}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;

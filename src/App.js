import React, { Component } from "react";
import "./App.scss";
import axios from 'axios';
import {
  Grommet,
  grommet,
  Box,
  Form,
  FormField,
  Calendar
} from "grommet";
import Price from "./Price";
import Diff from "./Diff";
import { w3cwebsocket as W3CWebSocket } from "websocket";


const theme = {
  global: {
    font: {
      family: "Karla",
      face:
        "/* latin-ext */\n@font-face {\n  font-family: 'Karla';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Karla'), local('Karla-Regular'), url(https://fonts.gstatic.com/s/karla/v13/qkBbXvYC6trAT7RbLtyU5rZPoAU.woff2) format('woff2');\n  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\n}\n/* latin */\n@font-face {\n  font-family: 'Karla';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Karla'), local('Karla-Regular'), url(https://fonts.gstatic.com/s/karla/v13/qkBbXvYC6trAT7RVLtyU5rZP.woff2) format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n"
    }
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date('2018-12-1'),
      amount: 1000,
      prices: [],
      currentPrice: 0,
      diff: null
    };
    let timeout = 250; // Initial timeout duration as a class variable
  }

  getAmountInvested = value => {
    this.setState({ amount: value });
  };

  updateCurrentPrice = value => {
    this.setState({ currentPrice: parseFloat(value).toFixed(2) });
  };

  updatePercentage = () => {
    // const amount = this.state.currentPrice;
    const amountOnDate = this.state.amountOnDate;
    const amount = this.state.currentPrice;
    if( amount && amountOnDate ) { 
      let percent = ((amount - amountOnDate) / amountOnDate) * 100;
      let gl = 1000 + 1000 * ( percent / 100 );
      let status = (percent >= 0) ? 'profit' : 'loss';
      this.setState({ 
        diff: percent,
        gl: gl,
        status: status
      });
    }
  }

  getHistoricalData = (dateVal) => {
    const ts = Math.round((new Date(dateVal)).getTime() / 1000);
    axios
      .get(`https://min-api.cryptocompare.com/data/pricehistorical?fsym=BTC&tsyms=USD&ts=${ts}`)
      .then(res => {
        console.log(res.data.BTC.USD);
        this.setState({amountOnDate: res.data.BTC.USD});
        this.setState({date: dateVal});
        this.updatePercentage();
      });
  };

  formatDate = (dateVal) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const newDate = new Date(dateVal);
    return newDate.toLocaleDateString(undefined, options);
  }

  getDateIso = (dateVal) => {
    return new Date(dateVal).toISOString();
  }
  /**
   * @function connect
   * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
   */
  connect = () => {
      var ws = new W3CWebSocket("wss://ws.kraken.com");
      let that = this; // cache the this
      var connectInterval;

      // websocket onopen event listener
      ws.onopen = evt => {
          console.log("connected websocket main component");
          const payload = {
          event: "subscribe",
          pair: ["XBT/USD"],
          subscription: {
              name: "ticker"
          }
          };
          ws.send(JSON.stringify(payload));
          that.timeout = 250; // reset timer to 250 on open of websocket connection
          clearTimeout(connectInterval); // clear Interval on on open of websocket connection
      };

      // websocket onclose event listener
      ws.onclose = e => {
          console.log(
          `Socket is closed. Reconnect will be attempted in ${Math.min(
              10000 / 1000,
              (that.timeout + that.timeout) / 1000
          )} second.`,
          e.reason
          );

          that.timeout = that.timeout + that.timeout; //increment retry interval
          connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
      };

      ws.onmessage = evt => {
          const message = JSON.parse(evt.data);
          if( message[0] === 4 ){
              let priceValue = message[1].a[0];
              this.updateCurrentPrice(priceValue);
              this.updatePercentage();
          }
      };

      // websocket onerror event listener
      ws.onerror = err => {
          console.error(
          "Socket encountered error: ",
          err.message,
          "Closing socket"
          );

          ws.close();
      };
  };

  /**
   * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
   */
  check = () => {
      const { ws } = this.state;
      if (!ws || ws.readyState == WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
  };

  componentDidMount() {
    this.getHistoricalData(this.state.date);
    this.formatDate(this.state.date);
    this.connect();
  }

  render() {
    let currentDate = new Date();
    return (
      <div className="App">
        <Grommet theme={theme} style={{ zIndex: 20, position: "relative" }}>
          <div className="app-layout">
            <Box
              align="center"
              justify="center"
              round="medium"
              background={{ color: "#fff" }}
              pad="large"
              elevation="medium"
            >
              <Form>
                <FormField label="I heard about Bitcoin on">
                  <Calendar
                    size="medium"
                    date={this.getDateIso(this.state.date)}
                    onSelect={(date) => this.getHistoricalData(date)}
                    bounds={["2010-01-01", `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`]}
                    />
                </FormField>
              </Form>
            </Box>

            <Box
              align="center"
              justify="center"
              pad="large"
            >
              <div><p>Current Price in USD:</p></div>
              <Price currentPrice={this.state.currentPrice}/>
              <div><p>A $1,000 investment made on<br></br> {this.formatDate(this.state.date)}
              <br></br>would now be worth:</p></div>
              <Diff 
                amount={this.state.amount} 
                amountOnDate={this.state.amountOnDate} 
                now={this.state.currentPrice} 
                diff={this.state.diff} 
                gl={this.state.gl} 
                status={this.state.status} />
            </Box>
          </div>
        </Grommet>
      </div>
    );
  }
}

export default App;

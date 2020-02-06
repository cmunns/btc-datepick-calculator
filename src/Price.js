import React, { Component } from "react";
import CurrencyFormat from "react-currency-format";

class Price extends Component {

  
  render() {
    return (
      <div className="current-price">
        <CurrencyFormat
          value={this.props.currentPrice}
          displayType={"text"}
          thousandSeparator={true}
          prefix={"$"}
          decimalScale={2}
        />
      </div>
    );
  }
}

export default Price;

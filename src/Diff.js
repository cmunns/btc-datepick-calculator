import React, { Component, useState, useEffect } from "react";
import CurrencyFormat from "react-currency-format";

const Diff = ({amount, amountOnDate, now, diff, gl, status}) => {
    const percentFormat = ( diff ) ? diff.toFixed(2) : null;
    const percentOutput = ( percentFormat ) ? `${percentFormat}%` : '';

    return(
        <div className="current-amounts">
            <div className="current-perc">
                {percentOutput}
            </div>
            <div className={`current-gain-loss ${status}`}>
                <CurrencyFormat
                    value={gl}
                    displayType={"text"}
                    thousandSeparator={true}
                    prefix={"$"}
                    decimalScale={2}
                />
            </div>
        </div>
    )
}

export default Diff;
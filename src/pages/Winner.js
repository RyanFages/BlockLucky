import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import axios from "axios";
import "../App.css";
import Snowfall from "react-snowfall";


function Winner() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [sum, setSum] = useState(1000); // Somme donnée en ETH
  const [isEuro, setIsEuro] = useState(false); // État pour savoir si la somme est en euros
  const [conversionRate, setConversionRate] = useState(0); // Taux de conversion ETH -> EUR

  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        const response = await axios.get(
          "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
        );
        setConversionRate(response.data.data.rates.EUR);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du taux de conversion:",
          error
        );
      }
    };

    fetchConversionRate(); // Fetch initial rate
    const interval = setInterval(fetchConversionRate, 5000); // Update rate every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleConversion = () => {
    setIsEuro(!isEuro);
  };

  const formatEuro = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const displaySum = isEuro ? formatEuro(sum * conversionRate) : `${sum} ETH`;


  return (
    <div className='Winner'>
      <Snowfall />
      <div className="container">
        {/* <img src={logo} alt="Logo" className="logo" /> */}
        <div className="sum">
          <h1>
            {displaySum} {isEuro}
          </h1>
          <button className="convert-button" onClick={handleConversion}>
            {isEuro ? "EUR" : "ETH"}
          </button>
        </div>
      </div>
      <h1>Bravo au gagnant</h1>
      <p className='ticket-winner'>Numéro du ticket gagnant : insérer ticket gagnant</p>
    </div>
  );
}

export default Winner;
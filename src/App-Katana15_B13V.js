import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import logo from './Picture/logo.png'; // Assurez-vous que le chemin est correct

function App() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [sum, setSum] = useState(1000); // Somme donnée en ETH
  const [isEuro, setIsEuro] = useState(false); // État pour savoir si la somme est en euros
  const [conversionRate, setConversionRate] = useState(0); // Taux de conversion ETH -> EUR
  const [info, setInfo] = useState(''); // État pour le contenu du cadre

  useEffect(() => {
    const targetDate = new Date('2024-12-01T00:00:00'); // Remplacez par la date future souhaitée
    const interval = setInterval(() => {
      const now = new Date();
      const timeRemaining = Math.max(0, Math.floor((targetDate - now) / 1000)); // Temps restant en secondes
      setRemainingTime(timeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        const response = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
        setConversionRate(response.data.data.rates.EUR);
      } catch (error) {
        console.error('Erreur lors de la récupération du taux de conversion:', error);
      }
    };

    fetchConversionRate(); // Fetch initial rate
    const interval = setInterval(fetchConversionRate, 5000); // Update rate every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(remainingTime / (60 * 60 * 24));
  const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
  const seconds = remainingTime % 60;

  const handleConversion = () => {
    setIsEuro(!isEuro);
  };

  const displaySum = isEuro ? (sum * conversionRate).toFixed(2) : sum;

  return (
    <div className="App">
      <div className="container">
        <img src={logo} alt="Logo" className="logo" />
        <div className="sum">
          Somme: {displaySum}
          <button className="convert-button" onClick={handleConversion}>
            {isEuro ? 'EUR' : 'ETH'}
          </button>
        </div>
        <div className="counter">
          {days} jours, {hours} heures, {minutes} minutes, {seconds} secondes
        </div>
      </div>
      <div className="bottom-box">
        <input
          type="text"
          placeholder="Ajouter des informations"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
        />
        <div className="info-display">
          fndhdjnj
          {info}
        </div>
      </div>
    </div>
  );
}

export default App;
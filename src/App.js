import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './App.css';
import logo from './Picture/logo.png';

function App() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [sum] = useState(1000); // Somme donnée en ETH
  const [isEuro, setIsEuro] = useState(false); // État pour savoir si la somme est en euros
  const [conversionRate, setConversionRate] = useState(0); // Taux de conversion ETH -> EUR
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [ticketsOwned] = useState([
    { number: 1, price: 0.1 },
    { number: 3, price: 0.2 },
    { number: 5, price: 0.3 }
  ]); // Liste des tickets possédés avec prix
  const [selectedTicket, setSelectedTicket] = useState(null); // État pour le ticket sélectionné
  const [setRandomNumbers] = useState([]); // État pour les chiffres aléatoires

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

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask est installé!');
    } else {
      console.log('MetaMask non détecté.');
    }
  }, []);

  const days = Math.floor(remainingTime / (60 * 60 * 24));
  const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
  const seconds = remainingTime % 60;

  const handleConversion = () => {
    setIsEuro(!isEuro);
  };

  const displaySum = isEuro ? (sum * conversionRate).toFixed(2) : sum;

  const connectWallet = async () => {
    console.log(window.ethereum); // Vérifiez la disponibilité de window.ethereum
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        setIsConnected(true);
      } catch (error) {
        console.error('Erreur lors de la connexion à MetaMask:', error);
      }
    } else {
      alert('MetaMask non détecté. Veuillez installer MetaMask.');
    }
  };

  const handleTicketClick = (ticket) => {
    let numCodes;
    if (ticket.number === 1) {
      numCodes = 1;
    } else if (ticket.number === 3) {
      numCodes = 3;
    } else if (ticket.number === 5) {
      numCodes = 5;
    }

    const randomNums = Array.from({ length: numCodes }, () => Math.floor(Math.random() * 1000) + 1);
    setSelectedTicket(ticket);
    setRandomNumbers(randomNums);
  };

  const handleBuyTickets = () => {
    if (selectedTicket) {
      alert(`Vous avez acheté ${selectedTicket.number} ticket(s) pour ${selectedTicket.price} ETH`);
      // Ajoutez ici la logique pour traiter l'achat des tickets
    } else {
      alert('Veuillez sélectionner un ticket avant d\'acheter.');
    }
  };

  return (
    <div className="App">
      <div className="container">
        <img src={logo} alt="Logo" className="logo" />
        <div className="sum">
          Somme: {displaySum} {isEuro ? 'EUR' : 'ETH'}
          <button className="convert-button" onClick={handleConversion}>
            Convertir
          </button>
        </div>
        <div className="counter">
          {days} jours, {hours} heures, {minutes} minutes, {seconds} secondes
        </div>
      </div>
      <button className="connect-wallet" onClick={connectWallet}>
        {isConnected ? `Connected: ${userAddress}` : 'Connect Wallet'}
      </button>
      <div className="bottom-container">
        <div className="bottom-box">
          <div className="lottery-info">
            <p>Pot de la loterie: {sum} ETH</p>
            <hr />
            <p>Tickets possédés: blablablaici</p>
            <hr />
            <div className="tickets">
              {ticketsOwned.map((ticket) => (
                <button key={ticket.number} className="ticket-button" onClick={() => handleTicketClick(ticket)}>
                  Ticket #{ticket.number} - {ticket.price} ETH
                </button>
              ))}
            </div>
          </div>
        </div>
        {selectedTicket !== null ? (
  <div className="extra-info-box">
    <p>Nombre d'entrer:</p>
    <h1>{selectedTicket.number}</h1>
    <div className="ticket-price">Prix: {selectedTicket.price} ETH</div>
    <button className="buy-button" onClick={handleBuyTickets}>Acheter</button>
  </div>
) : (
  <p>Sélectionnez un ticket pour voir les détails</p>
)}

        </div>
      </div>
  );
}

export default App;
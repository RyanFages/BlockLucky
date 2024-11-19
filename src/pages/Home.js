import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import "../App.css";
import Snowfall from "react-snowfall";

function Home() {
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();
  const [sum, setSum] = useState(1000); // Somme donnée en ETH
  const [isEuro, setIsEuro] = useState(false); // État pour savoir si la somme est en euros
  const [conversionRate, setConversionRate] = useState(0); // Taux de conversion ETH -> EUR
  const [info, setInfo] = useState(""); // État pour le contenu du cadre
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [ticketsOwned, setTicketsOwned] = useState([
    { number: 1, price: 0.1 },
    { number: 3, price: 0.2 },
    { number: 5, price: 0.3 },
  ]); // Liste des tickets possédés avec prix
  const [selectedTicket, setSelectedTicket] = useState(null); // État pour le ticket sélectionné
  const [randomNumbers, setRandomNumbers] = useState([]); // Liste des numéros aléatoires

  useEffect(() => {
    const targetDate = new Date("2024-12-01T00:00:00"); // Remplacez par la date future souhaitée
    const interval = setInterval(() => {
      const now = new Date();
      const timeRemaining = Math.max(0, Math.floor((targetDate - now) / 1000)); // Temps restant en secondes
      setRemainingTime(timeRemaining);

    if (timeRemaining === 0) {
        navigate('/winner'); // Redirige vers la page "À propos" lorsque le timer atteint 0
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

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

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask est installé!");
    } else {
      console.log("MetaMask non détecté.");
    }
  }, []);

  const days = Math.floor(remainingTime / (60 * 60 * 24));
  const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
  const seconds = remainingTime % 60;

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

  const connectWallet = async () => {
    console.log(window.ethereum); // Vérifiez la disponibilité de window.ethereum
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        setIsConnected(true);
      } catch (error) {
        console.error("Erreur lors de la connexion à MetaMask:", error);
      }
    } else {
      alert("MetaMask non détecté. Veuillez installer MetaMask.");
    }
  };

  const handleTicketClick = (ticket) => {
    let numCodes;
    if (ticket.number === 1) {
      numCodes = 1;
    } else if (ticket.number === 3) {
      numCodes = 3;
    } else {
      numCodes = 5;
    }
    const randomNums = Array.from(
      { length: numCodes },
      () => Math.floor(Math.random() * 100) + 1
    );
    setSelectedTicket(ticket);
    setRandomNumbers(randomNums);
  };

  const handleBuyTickets = () => {
    if (selectedTicket) {
      alert(
        `Vous avez acheté ${selectedTicket.number} ticket(s) pour ${selectedTicket.price} ETH.`
      );
    } else {
      alert("Veuillez sélectionner un ticket avant d'acheter.");
    }
  };

  return (
    <div className="Home">
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
        <div className="counter">
          {days} J, {hours} H, {minutes} min, {seconds} sec
        </div>
      </div>
      <div className="title">ETHERBAY</div>
      <button className="connect-wallet" onClick={connectWallet}>
        {isConnected ? `Connected: ${userAddress}` : "Connect Wallet"}
      </button>
      <div className="bottom-container">
        <div className="bottom-box">
          <div className="lottery-info">
            <p>Pot de la loterie: {sum} ETH</p>
            <hr />
            <p>Tickets possédés: ziqoshd</p>
            <hr />
            <div className="tickets">
              {ticketsOwned.map((ticket) => (
                <button
                  key={ticket.number}
                  className="ticket-button"
                  onClick={() => handleTicketClick(ticket)}
                >
                  Ticket = {ticket.number} \ {ticket.price} ETH
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
          <p></p>
        )}
      </div>
    </div>
  );
}

export default Home;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers"; // formatEther ajouté ici

import axios from "axios";
import "../App.css";
import Snowfall from "react-snowfall";

import lotteryABI from "../abis/lotteryABI.json"; // Import de l'ABI

const CONTRACT_ADDRESS = "0x032aFa7360A24cF2b56f159314e01aaCf12136DE"; // Remplacez par l'adresse de votre contrat déployé

function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");

  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();
  const [sum, setSum] = useState(0); // Somme donnée en ETH, initialisé à 0
  const [isEuro, setIsEuro] = useState(false); // État pour savoir si la somme est en euros
  const [conversionRate, setConversionRate] = useState(0); // Taux de conversion ETH -> EUR
  const [selectedTicket, setSelectedTicket] = useState(null); // État pour le ticket sélectionné
  const [randomNumbers, setRandomNumbers] = useState([]); // Liste des numéros aléatoires

  // Mise à jour : Ajoutez un état pour gérer la connexion
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [ticketsOwnedCount, setTicketsOwnedCount] = useState(0); // État pour le nombre de tickets possédés

  // Déclarer la liste des tickets disponibles
  const [ticketsOwned, setTicketsOwned] = useState([
    { number: 1, price: 0.002 },
    { number: 3, price: 0.005 },
    { number: 10, price: 0.01 },
  ]); // Liste des tickets possédés avec prix

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

  // Fonction pour se connecter au portefeuille MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Demander la connexion du compte MetaMask
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const tempProvider = new BrowserProvider(window.ethereum);
        const tempSigner = await tempProvider.getSigner();

        setProvider(tempProvider);
        setSigner(tempSigner);

        const tempContract = new Contract(CONTRACT_ADDRESS, lotteryABI, tempSigner);
        setContract(tempContract);

        const accounts = await tempProvider.listAccounts();
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0].address);
          setIsConnected(true);
          setUserAddress(accounts[0].address);
        }
      } catch (error) {
        console.error("Erreur lors de la connexion à MetaMask :", error);
      }
    } else {
      alert("MetaMask n'est pas installé. Veuillez installer MetaMask pour continuer.");
    }
  };

  // Fonction pour mettre à jour le montant du pot de la loterie
  const updateLotteryPot = async () => {
    if (contract) {
      try {
        console.log("Appel à getBalance pour obtenir le montant total du pot...");
        
        // Appel du smart contract
        const balanceInWei = await contract.getBalance();
        
        console.log("Montant du pot (en Wei) :", balanceInWei);
        
        // Conversion de Wei en ETH
        const balanceInEth = formatEther(balanceInWei);
        
        console.log("Montant du pot (en ETH) après conversion :", balanceInEth);
        
        // Mettre à jour l'état
        setSum(balanceInEth);
      } catch (error) {
        console.error("Erreur lors de la récupération du solde du contrat :", error);
      }
    }
  };

  // Fonction pour entrer dans la loterie avec le montant du ticket sélectionné
  const enterLottery = async (ticketPrice) => {
    if (!contract) {
      alert("Le contrat n'est pas encore initialisé. Assurez-vous que MetaMask est bien connecté.");
      return;
    }

    try {
      let valueToSend = parseEther(ticketPrice.toString()); // Convertir le prix en Wei
      const tx = await contract.enter({ value: valueToSend });
      await tx.wait(); // Attend la confirmation de la transaction
      alert("Vous avez rejoint la loterie avec succès !");
      updateTicketsOwnedCount(); // Mettre à jour le nombre de tickets après la transaction
      updateLotteryPot(); // Mettre à jour le pot de la loterie après l'achat
    } catch (error) {
      console.error("Erreur lors de l'entrée dans la loterie :", error);
    }
  };

  const updateTicketsOwnedCount = async () => {
    if (contract && currentAccount) {
      try {
        console.log("Appel à getEntriesByAddress pour l'adresse :", currentAccount);
        
        // Appel du smart contract
        const ticketsCount = await contract.getEntriesByAddress(currentAccount);
        
        console.log("Réponse du contrat pour getEntriesByAddress:", ticketsCount);
        
        // Conversion en nombre à partir de BigInt
        const count = Number(ticketsCount);
        
        console.log("Nombre de tickets possédés après conversion :", count);
        
        // Mettre à jour l'état
        setTicketsOwnedCount(count);
      } catch (error) {
        console.error("Erreur lors de la récupération des tickets possédés :", error);
      }
    }
  };  

  // Appeler `updateTicketsOwnedCount` et `updateLotteryPot` à chaque fois que le contrat est mis à jour
  useEffect(() => {
    if (contract) {
      updateTicketsOwnedCount();
      updateLotteryPot();
    }
  }, [contract]);

  const handleTicketClick = (ticket) => {
    let numCodes;
    if (ticket.number === 1) {
      numCodes = 1;
    } else if (ticket.number === 3) {
      numCodes = 3;
    } else {
      numCodes = 10;
    }
    const randomNums = Array.from(
      { length: numCodes },
      () => Math.floor(Math.random() * 100) + 1
    );
    setSelectedTicket(ticket);
    setRandomNumbers(randomNums);
  };

  const handleTutorialClick = () => {
    window.open("https://obvious-hisser-d97.notion.site/TUTORIEL-Participer-la-lotterie-EtherBay-en-4-tapes-143b788a28b88048abb6d2eae365f9e1?pvs=4", "_blank");
  };

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

  return (
    <div className="Home">
      <Snowfall />
      <div className="container">
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
      <div className="buttons-container">
        <button className="connect-wallet" onClick={connectWallet}>
          {isConnected ? `Connecté : ${userAddress}` : "Connecter mon wallet"}
        </button>
        <button className="tutorial-button" onClick={handleTutorialClick}>
          Voir le tutoriel
        </button>
      </div>
      <div className="bottom-container">
        <div className="bottom-box">
          <div className="lottery-info">
            <p>Pot de la loterie: {sum} ETH</p>
            <hr />
            <p>Tickets possédés: {ticketsOwnedCount}</p>
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
            <button className="buy-button" onClick={() => enterLottery(selectedTicket.price)}>Acheter</button>
          </div>
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
}

export default Home;

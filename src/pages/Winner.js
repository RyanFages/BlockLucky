import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatEther } from "ethers";
import axios from "axios";
import "../App.css";
import Snowfall from "react-snowfall";

import lotteryABI from "../abis/lotteryABI.json"; // Import de l'ABI

const CONTRACT_ADDRESS = "0x032aFa7360A24cF2b56f159314e01aaCf12136DE"; // Remplacez par l'adresse de votre contrat déployé

function Winner() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [winnerAddress, setWinnerAddress] = useState("");
  const [prizeAmount, setPrizeAmount] = useState(0);
  const [sum, setSum] = useState(0); // Somme gagnée par le gagnant, initialisée à 0
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

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask est installé!");
      connectToContract();
    } else {
      console.log("MetaMask non détecté.");
    }
  }, []);

  // Fonction pour se connecter au contrat via MetaMask
  const connectToContract = async () => {
    try {
      const tempProvider = new BrowserProvider(window.ethereum);
      setProvider(tempProvider);
      const tempContract = new Contract(CONTRACT_ADDRESS, lotteryABI, tempProvider);
      setContract(tempContract);
      console.log("Contrat connecté :", tempContract);
      fetchWinnerData(tempContract); // Appeler les informations sur le gagnant après connexion
    } catch (error) {
      console.error("Erreur lors de la connexion au contrat :", error);
    }
  };

  // Fonction pour obtenir les informations sur le gagnant
  const fetchWinnerData = async (contract) => {
    try {
      // Remplacez `1` par l'ID de la dernière loterie terminée si vous avez plusieurs
      const lotteryId = 1; // Vous pouvez remplacer par la valeur correcte
      console.log("Appel à getWinnerByLottery pour lotteryId :", lotteryId);
      const [winner, prize] = await contract.getWinnerByLottery(lotteryId);
      
      console.log("Gagnant :", winner);
      console.log("Montant du prix (en Wei) :", prize);
      
      setWinnerAddress(winner);
      setPrizeAmount(formatEther(prize)); // Conversion de Wei en ETH
      setSum(formatEther(prize));
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du gagnant :", error);
    }
  };

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
        <div className="sum">
          <h1>
            {displaySum} {isEuro}
          </h1>
          <button className="convert-button" onClick={handleConversion}>
            {isEuro ? "EUR" : "ETH"}
          </button>
        </div>
      </div>
      
      {/* Regroupement des éléments dans un div centré */}
      <div className="winner-info">
        <h1>Bravo au gagnant</h1>
        <p className='ticket-winner'>Adresse du gagnant : {winnerAddress}</p>
        <p className='ticket-winner'>Montant gagné : {displaySum}</p>
      </div>
    </div>
  );
}

export default Winner;

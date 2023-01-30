export const CONTACT_ADDRESS = '0x01f4e9CeF4138A87f4a24023bAAae00729b32185';

export const CONTACT_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "count",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "7d25d81c17e01da642f6fd92da2426cd25c9a768ae203806ef075233481250db"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "AlphaToken",
    "outputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "tokenName",
        "type": "string"
      },
      {
        "name": "tokenSymbol",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "7d25d81c17e01da642f6fd92da2426cd25c9a768ae203806ef075233481250db"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor",
    "signature": "constructor"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_tokenName",
        "type": "string"
      },
      {
        "name": "_tokenSymbol",
        "type": "string"
      }
    ],
    "name": "AlphaToken",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "7d25d81c17e01da642f6fd92da2426cd25c9a768ae203806ef075233481250db"
  }
];

export const explorerUrls ={
  137:`https://polygonscan.com/tx/`,
  80001:`https://mumbai.polygonscan.com/tx/`,
}
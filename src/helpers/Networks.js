const Web3 = require('web3');
const web3 = new Web3(window.ethereum);

export const Networks =
    {
      '137':  {
            chainId: 137,
            name: 'polygon',
            hex: web3.utils.toHex("137"),
            rpcUrls: ["https://polygon-rpc.com"],
            chainName: "Polygon Mainnet",
            nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC", // 2-6 characters long
                decimals: 18,
            },
            blockExplorerUrl: ["https://polygonscan.com/"],
        },
     '80001':   {
            chainId: 80001,
            name: 'polygon',
            hex: web3.utils.toHex("80001"),
            rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
            chainName: "Polygon Testnet Mumbai",
            nativeCurrency: {
                name: "tMATIC",
                symbol: "tMATIC", // 2-6 characters long
                decimals: 18,
            },
            blockExplorerUrl: ["https://mumbai.polygonscan.com/"],
        },
    '56':    {
            chainId: 56,
            name: 'bsc',
            hex: web3.utils.toHex("56"),
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            chainName: "Smart Chain",
            nativeCurrency: {
                name: "BNB",
                symbol: "BNB", // 2-6 characters long
                decimals: 18,
            },
            blockExplorerUrl: ["https://bscscan.com"],
        },
      "97":  {
            chainId: 97,
            name: 'bsc',
            hex: web3.utils.toHex("97"),
            rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
            chainName: "Smart Chain - Testnet",
            nativeCurrency: {
                name: "BNB",
                symbol: "BNB", // 2-6 characters long
                decimals: 18,
            },
            blockExplorerUrl: ["https://testnet.bscscan.com"],
        },
      '43114':  {
            chainId: 43114,
            name: 'avalanche',
            hex: web3.utils.toHex("43114"),
            rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
            chainName: "Avalanche C-Chain",
            nativeCurrency: {
                name: "Avalanche",
                decimals: 18,
                symbol: "AVAX"
            },
            blockExplorerUrl: ["https://snowtrace.io"],
        },
       '43113': {
            chainId: 43113,
            name: 'avalanche',
            hex: web3.utils.toHex("43113"),
            rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
            chainName: "Avalanche Fuji Testnet",
            nativeCurrency: {
                name: "Avalanche",
                decimals: 18,
                symbol: "AVAX"
            },
            blockExplorerUrl: ["https://testnet.snowtrace.io"],
        },
      '1':  {
            chainId: 1,
            name: 'ethereum',
            hex: web3.utils.toHex("1"),
            rpcUrls: ["https://mainnet.infura.io/v3/"],
            chainName: "Ehereum Mainnet",
            nativeCurrency: {
                name: "Ethereum",
                decimals: 18,
                symbol: "ETH"
            },
            blockExplorerUrl: ["https://etherscan.com/"],
        },
       '5': {
            chainId: 5,
            name: 'ethereum',
            hex: web3.utils.toHex("5"),
            rpcUrls: ["https://goerli.infura.io/v3/"],
            chainName: "Goerli Testnet",
            nativeCurrency: {
                name: "Ethereum",
                decimals: 18,
                symbol: "ETH"
            },
            blockExplorerUrl: ["https://goerli.etherscan.io/"]
        }

    };

export const NetworksId = [
    137,
    80001,
    3,
    56,
    97,
    1,5,
    43113, 43114,
];
export const RPC_URLS ={

    137: "https://polygon-rpc.com",
    5:"https://goerli.infura.io/v3/",
    80001: "https://rpc-mumbai.maticvigil.com",
    3:"https://ropsten.infura.io/v3/1f32a6562a8c4cae9f9d32c4ed179314",
    1:"https://mainnet.infura.io/v3/1f32a6562a8c4cae9f9d32c4ed179314",
    4:"https://mainnet.infura.io/v3/1f32a6562a8c4cae9f9d32c4ed179314",
    42:"https://mainnet.infura.io/v3/1f32a6562a8c4cae9f9d32c4ed179314",


};

export const  recheckURL ={
    "80001":"https://mumbai.polygonscan.com",
    "137": "https://polygonscan.com",
    "56":  "https://bscscan.com",
    "97":"https://testnet.bscscan.com",
    "43114":"https://snowtrace.io",
    "43113":"https://testnet.snowtrace.io",
    "1":"https://etherscan.com",
    "5":"https://goerli.etherscan.io",
    
  }
export const networkParams = {
    "0x63564c40": {
      chainId: "0x63564c40",
      rpcUrls: ["https://api.harmony.one"],
      chainName: "Harmony Mainnet",
      nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
      blockExplorerUrls: ["https://explorer.harmony.one"],
      iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
    },
    "0xa4ec": {
      chainId: "0xa4ec",
      rpcUrls: ["https://forno.celo.org"],
      chainName: "Celo Mainnet",
      nativeCurrency: { name: "CELO", decimals: 18, symbol: "CELO" },
      blockExplorerUrl: ["https://explorer.celo.org"],
      iconUrls: [
        "https://celo.org/images/marketplace-icons/icon-celo-CELO-color-f.svg"
      ]
    }
  };
export const web3ApiKey = 'tYb92DZJ14U1SsxCAasd9hZFcYrlVDzLA1I9kg4pXQwehwLkVG5B8XGB0H5UFXky';  
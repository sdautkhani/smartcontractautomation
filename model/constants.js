 const Enum=require("enum");
module.exports={
    tokenStatus: new Enum(['Pending','Deployed','Verified','Rejected']),
    supplyTypeList:new Enum(['Fixed','10K','Unlimited','Capped']),
    accessTypeList:new Enum(['None','Ownable','Role Based']),
    transferTypeList:new Enum(['Unstoppable','Pausable']),
    tokenTypeList : new Enum(['ERC20','ERC721','ERC1155','HelloERC20','SimpleERC20','StandardERC20','BurnableERC20','MintableERC20','PausableERC20','CommonERC20','UnlimitedERC20','AmazingERC20','PowerfulERC20']),
    networkList : new Enum(['Polygon','Polygon Testnet','Bsc Test Network','Avalanche Fuji Testnet','Goerli Testnet','Main Ethereum Network','BSC','Ropsten Test Network','Rinkeby Test Network','Kovan Test Network']),
    contractTp : new Enum(['ERC20', 'ERC721', 'ERC1155']),
    recheckURL :{
        "80001":"https://mumbai.polygonscan.com/tx/",
        "137": "https://polygonscan.com/tx/",
        "56":  "https://bscscan.com/tx/",
        "97":"https://testnet.bscscan.com",
        "43114":"https://snowtrace.io",
        "43113":"https://testnet.snowtrace.io",
        "1":"https://etherscan.com/",
        "5":"https://goerli.etherscan.io/",
        
      }
}
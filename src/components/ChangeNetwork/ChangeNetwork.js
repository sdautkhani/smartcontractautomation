import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core';
import WalletConnect from '../WalletConnect';
import {
 Networks, NetworksId,
} from "../../helpers/";
const Web3 = require('web3');
export default function ChangeNetwork() {
  const { library, chainId, account, active } = useWeb3React();
  const [showPopup, setshowPopup] = useState(false);
  const web3 = new Web3(library?.provider);

  useEffect(() => {
    if (account != undefined) {
      if (!NetworksId.includes(chainId)) {
        setshowPopup(!showPopup);
      }
    }
  }, [chainId])
  useEffect(async () => {
    if (!account) {
      setshowPopup(true);
    } else {
      setshowPopup(false);
    }
  }, [account])
  const changeNetworks = (values) => {
    ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: web3.utils.toHex(values) }]
    }).then(() => {
      setshowPopup(!showPopup);
    }).catch(async (err) => {
      if (err.code == "4902") {
            await ethereum.request({
              id: 1,
              jsonrpc: "2.0",
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: Networks[chainId].hex,
                  rpcUrls: Networks[chainId].rpcUrls,
                  chainName:Networks[chainId].chainName,
                  nativeCurrency:Networks[chainId].nativeCurrency,
                  blockExplorerUrls: Networks[chainId].blockExplorerUrls,
                },
              ],
            });
      }
    })
  }
  return (

    <>

      {showPopup &&
       
        <div  class=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full">
        <div class="relative p-4 w-full h-full bg-transparent">
            <div class="flex justify-center items-center relative w-1/2 left-1/4 top-1/4 right-1/4 bg-white rounded-lg shadow bg-white">
                
                <div class="p-6 text-center">
                    <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           {account == undefined ?
              <div>
                <div>
                You have to Connect the Wallet
              </div>
              <div>
              <WalletConnect showAddressString={true} connectButtonText="connect Wallet"  />
              </div>

              </div>
              :
              <div>
              <div>
                Network selected in your wallet is not supported. Please switch to one of supported networks.
              </div>



              <div className=" flex flex-row text-left w-max-lg">
                <button type='submit' className="flex-grow  w-60 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 mr-4 rounded mt-9" onClick={() => changeNetworks("137")} >
                  Polygon Mainnet
                </button>
                <button type='submit' onClick={() => changeNetworks("80001")} className="flex-grow  w-60 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded mt-9" >
                  Polygon Testnet
                </button>
              </div>
              </div>}
                    
                </div>
            </div>
        </div>
    </div>
      }
    </>
  )
}
import React, { useState, useEffect } from 'react';
import NetworkModal from "../NetworkModal";
import { AvalancheIcon, BscIcon, CreateTokenIcon, EthereumIcon, PolygonIcon } from '../../assets/SvgComponent';
const Web3 = require('web3');
import {
    Networks
} from "../../helpers";
import { useWeb3React } from '@web3-react/core';


export default function SwitchNetworkButtons() {
    const { library, account, chainId } = useWeb3React();
    console.log(chainId);
    const [selectedNetwork, setSelectedNetwork] = useState(Networks[chainId]!= undefined && Networks[chainId].name);
    const [showModal, setShowModal] = useState(false);
    const [currentNetwork, setCurrentNetwork] = useState(Networks[chainId]!= undefined && Networks[chainId].name);
    
    const networkChanged = (val) => {
        setShowModal(true)
        setSelectedNetwork(val)
    }

    const networkSelected = (val) => {
      let networkData=Object.values(Networks);
      console.log(networkData);
      let indx=networkData.findIndex(item=>item.name==val);
            ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: networkData[indx].hex }]
            }).then(() => {

                setCurrentNetwork(networkData[indx].name)
                setSelectedNetwork(networkData[indx].name)
            }).catch(async (err) => {

                if (err.code == "4902") {
                        await ethereum.request({
                            id: 1,
                            jsonrpc: "2.0",
                            method: "wallet_addEthereumChain",
                            params: [
                                {
                                    chainId: networkData[indx].hex,
                                    rpcUrls: networkData[indx].rpcUrls,
                                    chainName: networkData[indx].chainName,
                                    nativeCurrency: networkData[indx].nativeCurrency,
                                    blockExplorerUrls: networkData[indx].blockExplorerUrls,
                                },
                            ],
                        });
                   // }

                }
            }).finally(() => {
                setShowModal(false)
            })
      
    }
    return (
        <>
            <div className='my-4'>
                <div className='grid grid-cols-2 gap-4'>
                    <div onClick={() => networkChanged("ethereum")}
                        className={selectedNetwork === 'ethereum'
                            ? 'cursor-pointer col-span-1 flex flex-row border border-gray-300 p-4 rounded bg-blue-50'
                            : 'cursor-pointer col-span-1 flex flex-row border border-gray-300 p-4 rounded'}>
                        <EthereumIcon />
                        <p className='ml-2'>Ethereum</p>
                    </div>

                    <div onClick={() => networkChanged('avalanche')}
                        className={selectedNetwork === 'avalanche'
                            ? 'cursor-pointer col-span-1 flex flex-row border border-gray-300 p-4 rounded bg-blue-50'
                            : 'cursor-pointer col-span-1 flex flex-row border border-gray-300 p-4 rounded'}>
                        <AvalancheIcon />
                        <p className='ml-2'>Avalanche</p>
                    </div>
                </div>
                <div className='box grid grid-cols-2 gap-4 mt-4'>
                    <div onClick={() => networkChanged('polygon')}
                        className={selectedNetwork === 'polygon'
                            ? 'cursor-pointer col-span-1 flex flex-row border border-gray-300 p-4 rounded bg-blue-50'
                            : 'cursor-pointer col-span-1 flex flex-row border border-gray-300 p-4 rounded'}>
                        <PolygonIcon />
                        <p className='ml-2'>Polygon</p>
                    </div>

                    <div onClick={() => networkChanged('bsc')}
                        className={selectedNetwork === 'bsc'
                            ? 'cursor-pointer col-span-1 flex flex-row border border-gray-300 p-4 rounded bg-blue-50'
                            : 'cursor-pointer col-span-1 flex flex-row border border-gray-300 p-4 rounded'}>
                        <BscIcon />
                        <p className='ml-2'>Bsc</p>
                    </div>
                </div>
            </div>
            {showModal ?
                    <NetworkModal
                        selectedNetwork={selectedNetwork}
                        currentNetwork={currentNetwork}
                        networkSelected={(val) => { networkSelected(val) }}
                    /> : null}

        </>
    )
}
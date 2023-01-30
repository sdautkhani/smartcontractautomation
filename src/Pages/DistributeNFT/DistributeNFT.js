import React, { useState} from 'react';
import ChangeNetwork from '../../components/ChangeNetwork';
import DistributeNFTComponent from '../../components/DistributeNFT/DistributeNFT';
import NFTDistributionSummery from "../../components/NFTDistributionSummery";

export default function DistributeNFT() {
    const [tokenList, setFinalTokenList] = useState(null);
    const [contractAddress, setContractAddress] = useState("");
    return (
        <>
            <p className='text-2xl font-medium'>NFT Multisender</p>
            <ChangeNetwork />
            {tokenList == null ?
            <DistributeNFTComponent setFinalTokenList={setFinalTokenList} setContractAddress={setContractAddress} />
            :
            <NFTDistributionSummery tokenList={tokenList} contractAddress={contractAddress}/>
            }
        </>
    )

}
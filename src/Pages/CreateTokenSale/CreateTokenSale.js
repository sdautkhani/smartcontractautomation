import React, { useState } from 'react'
import TokenSaleAddress from "../../components/TokenSaleAddress"
import TokenSaleConfig from "../../components/TokenSaleConfig"
import TokenSalePreview from "../../components/TokenSalePreview"
import ChangeNetwork from "../../components/ChangeNetwork";
export default function CreateTokenSale() {
    const [tokenaddr, setTokenAddress] = useState();
    const [tokenSaleDetails, settokenSaleDetails] = useState(null);
    const getTokenAddress = (details) => {
        setTokenAddress(details);

    }
    return (
        <div>
            <p className='text-2xl font-medium'>STO / IDO / ICO token sale script</p>
            <ChangeNetwork />
            {tokenaddr == undefined ||tokenaddr == null ?
                <TokenSaleAddress getTokenAddress={getTokenAddress} />
                :
                
                tokenSaleDetails==null ?
                
                <TokenSaleConfig tokenaddr={tokenaddr} settokenSaleDetails={settokenSaleDetails} />
                :
                <TokenSalePreview tokenSaleDetails={tokenSaleDetails}/>
            }

        </div>
    )
}
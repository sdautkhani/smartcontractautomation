import React, { useState } from 'react'
import ManageSaleAddress from "../../components/ManageSaleAddress"
import ManageSalePreview from "../../components/ManageSalePreview"
import ChangeNetwork from "../../components/ChangeNetwork";
export default function ManageTokenSale() {
    const [tokenaddr, setTokenAddress] = useState();
    const getTokenAddress = (details) => {
        setTokenAddress(details);

    }
    return (
        <div>
            <p className='text-2xl font-medium'>Manage token sale</p>
            <ChangeNetwork />
            {tokenaddr == undefined ||tokenaddr == null ?
                <ManageSaleAddress getTokenAddress={getTokenAddress} />
                :
                <ManageSalePreview tokenaddr={tokenaddr} />
            }

        </div>
    )
}
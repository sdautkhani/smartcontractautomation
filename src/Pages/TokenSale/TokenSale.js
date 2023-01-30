import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Shared/Header';
import TokenSaleComponent from "../../components/TokenSaleComponent"
import ChangeNetwork from "../../components/ChangeNetwork";

export default function TokenSale() {

    const params = useParams();
    const [tokenaddr, setTokenAddress] = useState(params.address);
    return (
        <div>
            {/* <p className='text-2xl font-medium'>Manage token sale</p> */}
            <ChangeNetwork />
            {(tokenaddr != undefined && tokenaddr != null) &&
                <div>
                 
                    <div className='bg-white p-6'>
                        <Header />
                    </div>
                    
                    <div className='bg-blue-50 '>
                        <TokenSaleComponent tokenaddr={tokenaddr} chainId={params.chainId} />
                    </div>
                    
                </div>

            }

        </div>
    )
}
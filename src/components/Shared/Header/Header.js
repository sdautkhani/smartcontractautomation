import React, { Component, useEffect, useState } from 'react';
import {  useNavigate,useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify';
import images from '../../../assets/icons';
import {
  metaMaskLogin
} from "../../../helpers";
import WalletConnect from '../../WalletConnect';
import { useWeb3React } from '@web3-react/core';
import { useTransactionStatusStore } from '../../../Store';
import { MySpinner } from '../../WalletConnect/Web3Modal';


export default function Header({ connectWalletFn }) {
  const { account,active,deactivate } = useWeb3React();
  const showPending = useTransactionStatusStore((state) => state.showPending);
  const Location=useLocation();
  const showLogout=!(Location.pathname).includes("tokenSale");

useEffect(async () => {
    if (account) {
        const resp = await metaMaskLogin(account);
        if (resp == "success") {
          const inputUrl=Location.pathname;
          if(!inputUrl.includes("tokenSale")){
               navigate("/dashboard");
          }
        
        } else {
            toast.error(resp.msg);
        }
      

    }
}, [account]);

  const logOut = async () => {
    deactivate()
    sessionStorage.clear();

    navigate("/");

  }


  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false)
  return (
    <div className='flex items-center justify-between '>
      <div className='flex flex-row'>
       
      </div>
      <div className='flex flex-row items-center justify-center'>

        <div className={`${!showPending ? 'w-48' : ''} flex flex-col bg-blue-50 rounded-lg cursor-pointer`} >
          { showPending ?
              <div className='flex items-center border rounded-md border-slate-400'>
                <span className='mr-1'>1</span> <WalletConnect showAddressString={true} connectButtonText=" Pending" />
                <span className='ml-2'>
                  <MySpinner />
                </span>
              </div> :
              <div className='flex flex-row items-center border-b border-white' >
                {active ?
                  <span className='w-40 text-truncate ' onClick={() => { setShowOptions(!showOptions) }}>
                    {account?.slice(0, 4) + "..." + account?.slice(-4)}
                  </span>
                  :
                  <span className='w-40 text-truncate '>
                    <WalletConnect disconnectButton={false} />
                  </span>
                }

              <img src={images.MetaMask} style={{ width: "25px", height: '25px' }}></img>
            
              </div>
              }
          {!showOptions ? null :
          <>
           
            <div className='h-10 flex items-center justify-center cursor-pointer'>
              <p className=' text-sm text-gray-500 text-center'>
              <WalletConnect disconnectButton={false} connectButtonText={'Change Wallet'}/>
              </p>
            </div>
            <hr />
            {showLogout && <div className='h-10 flex items-center justify-center cursor-pointer' onClick={() => { logOut() }}>
            <p className=' text-sm text-yellow-500 text-center'>
              Sign Out
            </p>
          </div>}
          </>
          }
        </div>
      </div>

    </div>
  )
}

Header.propTypes = {
  connectWalletFn: PropTypes.func,
}

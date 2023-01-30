import React, { useEffect, useState } from 'react';
import { NavLink } from "react-router-dom";
import { toast } from 'react-toastify';
import Loader from 'react-loading';
import { useWeb3React } from '@web3-react/core';
import SwitchNetworkButtons from '../SwitchNetworkButtons';
import CommandPalette from "../CommandPalette";
const Web3 = require('web3');

import {
    USER_BASE_URL,
    globalService,
    GET_CONTRACT_VALUE,
    web3ApiKey
} from "../../helpers";
import { CreateTokenIcon } from '../../assets/SvgComponent';
export default function TokenSaleAddress({ getTokenAddress }) {
    const { library,account,chainId } = useWeb3React();
    const web3 = new Web3(library?.provider);
    const [tokenAddress, setTokenAddress] = useState("");
    const [isloading, setLoading] = useState(false);
    const [isBtnDisable, setIsBtnDisable] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [tokenList,setTokenList]=useState([]);
    var tokenDetails = {};
    const getTokenDetails = async () => {

        validate(tokenAddress);
        let temp=tokenList.filter(item => item.token_address == tokenAddress)[0];
        getTokenAddress(temp);
      
    }
   const handleAddressChange = (tokenAddrs) => {}
useEffect(()=>{
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'X-API-Key': web3ApiKey
            }
        };
     
        let hexchainid=web3.utils.toHex(chainId);
        fetch(`https://deep-index.moralis.io/api/v2/${account}/erc20?chain=${hexchainid}`, options)
            .then(response => response.json())
            .then(response => {
                setTokenList(response)
               
            })
            .catch(err => console.log(err));
       
    },[])

    useEffect(()=>{
        console.log(tokenAddress)
        validate(tokenAddress);
      
    },[tokenAddress])
    const validate = (tokenAddrs) => {
        let contractAddress_regex = new RegExp('0x[a-fA-F0-9]{40}$');
        if (tokenAddrs == "") {
            setErrorMsg("Token Address Required");
            setIsBtnDisable(true);
        } else if (!contractAddress_regex.test(tokenAddrs)) {
            setErrorMsg("Required Valid Token Address");
            setIsBtnDisable(true);
        } else {
            setErrorMsg("");
            setIsBtnDisable(false);
        }
    }
    return (
        <div className='grid grid-row-2 md:grid-cols-2 bg-white rounded-lg mt-5 p-4'>

            <div className='row-span-1 md:col-span-1 p-6'>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Create your token presale in minutes</p>
                </div>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Proven solidity crowdsale contract</p>
                </div>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Run an initial coin offering (ICO)</p>
                </div>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Run a security token offering (STO)</p>
                </div>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Create an IDO token presale</p>
                </div>
                <SwitchNetworkButtons></SwitchNetworkButtons>
            </div>

            <div className="row-span-1 md:col-span-1 w-full my-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700 mx-auto">
{/* 
                <div>
                    <label for="tokanAddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Token contract address<span className="text-red-600">*</span></label>
                    <input
                        type="text"

                        name="tokanAddress"
                        id="tokanAddress"
                       
                        list="opts"
                       
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Token Name"
                        onChange={(e) => {
                            handleAddressChange(e.currentTarget.value)

                        }}
                        required
                    />
                    <datalist id="opts">
                    <option>One</option>
                    <option>Two</option>
                    <option>Three</option>
                    </datalist>

                    {errorMsg != "" && (
                        <div className="help-block text-red-900 text-sm">{errorMsg}</div>
                    )}

                </div> */}
                <div>
                    <CommandPalette inputLabel={"Token contract address"} tokenList={tokenList} setTokenAddress={setTokenAddress}></CommandPalette>
                    {errorMsg != "" && (
                        <div className="help-block text-red-900 text-sm">{errorMsg}</div>
                    )}    
                </div>

                <div className="intro-x text-center xl:text-left">
                    {isloading ? <div className="cover-spin flex justify-center items-center">

                        <Loader type={'spinningBubbles'} color="#ed8936" />
                    </div> :
                        <button type='submit' className="w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded mt-9" onClick={getTokenDetails}>
                            Continue
                        </button>
                    }

                </div>
            </div>
        </div>
    )
}
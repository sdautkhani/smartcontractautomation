import React, { useState } from 'react';
import { NavLink} from "react-router-dom";
import { toast } from 'react-toastify';
import Loader from 'react-loading';
import { useWeb3React } from '@web3-react/core';
import SwitchNetworkButtons from '../SwitchNetworkButtons'
const Web3 = require('web3');

import {
    USER_BASE_URL,
    globalService,
    GET_CONTRACT_VALUE
} from "../../helpers";
import { CreateTokenIcon } from '../../assets/SvgComponent';
export default function ManageSaleAddress({ getTokenAddress }) {
    const { library} = useWeb3React();
    const web3 = new Web3(library?.provider);
    const [tokenAddress, setTokenAddress] = useState("");
    const [isloading, setLoading] = useState(false);
    const [isBtnDisable, setIsBtnDisable] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    var tokenDetails = {};
    const getTokenDetails = async () => {

        validate(tokenAddress);
        if (tokenAddress != "" && errorMsg == "") {
            setLoading(!isloading);
            const user = JSON.parse(sessionStorage.getItem("user"));
            try {
                let reqObj = {
                    method: "GET",
                    headers: { "authorization": `Bearer ${user.token}` },
                    url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,//CommonERC20,

                };

                var resp = await globalService(reqObj);
                if (resp != null) {

                    const tokenInst = new web3.eth.Contract(resp.contractABI, tokenAddress);
                    tokenDetails.tokenSupply = await tokenInst.methods.totalSupply().call();
                    tokenDetails.tokenName = await tokenInst.methods.name().call();
                    tokenDetails.balanceToken= await tokenInst.methods.tokenLeft().call();
                    tokenDetails.tokenAddress = tokenAddress;
                    tokenDetails.ispaused = false;


                }
            } catch (ex) {
                
                setLoading(false);
                tokenDetails=null;
                
                toast.error("Invalid Contract Address");

            }
        
         
        }
    }
    const handleAddressChange = (tokenAddrs) => {
        validate(tokenAddrs);
        setTokenAddress(tokenAddrs);
    }
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
                    <p className='text-base font-light pl-2'>Edit parameters prior to sale start</p>
                </div>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Whitelist investor addresses</p>
                </div>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Withdraw funds from sale contract</p>
                </div>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Withdraw tokens from sale contract</p>
                </div>
                <div className='flex flex-row items-center mb-3'>
                    <div className='w-6'>
                        <CreateTokenIcon />
                    </div>
                    <p className='text-base font-light pl-2'>Get shareable token sale URL</p>
                </div>
                <SwitchNetworkButtons></SwitchNetworkButtons>
            </div>

            <div className="row-span-1 md:col-span-1 w-full my-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700 mx-auto">

                <div>
                    <label for="tokanAddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Token contract address<span className="text-red-600">*</span></label>
                    <input
                        type="text"
                        name="tokanAddress"
                        id="tokanAddress"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Token contract address"
                        onChange={(e) => {
                            handleAddressChange(e.currentTarget.value)

                        }}
                        required
                    />
                    {errorMsg != "" && (
                        <div className="help-block text-red-900 text-sm">{errorMsg}</div>
                    )}
                </div>

                <div className="intro-x text-center xl:text-left">
                    {isloading ? <div className="cover-spin flex justify-center items-center">

                        <Loader type={'spinningBubbles'} color="#ed8936"/>
                    </div> :
                        <button type='submit' className="w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded mt-9" onClick={()=>{getTokenAddress(tokenAddress)}}>
                            Continue
                        </button>
                    }
                    <br></br>
                    <p className='my-2'>
                        Don’t have your own token yet? <NavLink to="/create" className="text-blue-500"> Create Token </NavLink>
                    </p>

                </div>
            </div>
        </div>
    )
}
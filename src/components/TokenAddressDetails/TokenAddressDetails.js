import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
const Web3 = require('web3');
import {
    USER_BASE_URL,
    globalService,
    GET_CONTRACT_VALUE,
    GassFeeCalculation
} from "../../helpers";



export default function TokenAddress({ tokenaddr }) {
    const { library,account} = useWeb3React();
    const web3 = new Web3(library?.provider);
    const [address, setaddress] = useState("");
    const [amount, setamount] = useState("");
    const [isowner, setisowner] = useState();
    const [gassvalue, setgassvalue] = useState("");
    const [isPaused, setIspaused] = useState(tokenaddr.ispaused);
    useEffect(() => {
       
        if(tokenaddr.Owner!=undefined){
            setisowner((tokenaddr.Owner).toLowerCase() == account.toLowerCase()?true:false );
        }
       
       
     
    }, [tokenaddr])
    const handleFunctionCalls = async (methodName) => {
       
        const user = JSON.parse(sessionStorage.getItem("user"));
        try {
            let tokentype = "CommonERC20";
            if (methodName == "Pause" || methodName == "UnPause") {
                tokentype = "PausableERC20";
            } else if (methodName == "blacklistaddress") {
                tokentype = "erc20Airdrop";

            }
            let reqObj = {
                method: "GET",
                headers: { "authorization": `Bearer ${user.token}` },
                url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/${tokentype}`,

            };

            var resp = await globalService(reqObj);
            if (resp != null) {

                const tokenInst = new web3.eth.Contract(resp.contractABI, tokenaddr.tokenAddress);
                let reqObj = {};
                if (methodName == "mint") {
                    if (address == "") {
                        toast.error("Provide Minter Address.");
                        return false;
                    } else if (amount == "") {
                        toast.error("Provide Amount.");
                        return false;
                    } else {
                        reqObj = {
                            contractABI: resp.contractABI,
                            contractAddress: tokenaddr.tokenAddress,
                            address: address,
                            amount: amount,
                            account: account,
                            provider:library?.provider,
                            methodName: methodName

                        }
                        GassFeeCalculation(reqObj).then((finalGasInEther)=>{
                            setgassvalue(finalGasInEther);

                            tokenInst.methods.mint(address.trim(), amount).send(
                                { from: account }, function (err, res) {
    
                                    if (err) {
                                       
                                        toast.error(err.message);
                                    }
                                    
                                    toast.success("Transaction Successful With TxHash-",res)
                                }
                            )
                        }).catch(ex=>{
                            toast.error("Invalid Contract Adddress For Mint")
                        })
                    
                    }

                } else if (methodName == "burn") {
                    //toast.error("Burn is not in Smart contract");
                    if (amount == "") {
                        toast.error("Provide Amount.");
                        return false;
                    } else {
                        reqObj = {
                            contractABI: resp.contractABI,
                            contractAddress: tokenaddr.tokenAddress,
                            address: address,
                            amount: amount,
                            account: account,
                            provider:library?.provider,
                            methodName: methodName

                        }
                        GassFeeCalculation(reqObj).then((finalGasInEther)=>{
                        setgassvalue(finalGasInEther);
                        tokenInst.methods.burn(address.trim(), amount).send(
                            { from: account }, function (err, res) {

                                if (err) {
                                    
                                    toast.error(err.message);
                                }
                               
                                toast.success("Transaction Successful With TxHash-",res)
                            }
                        )
                    }).catch(ex=>{
                        toast.error("Invalid Contract Adddress For Burn")
                    })
                    }

                } else if (methodName == "changeowner") {
                    if (address == "") {
                        toast.error("Provide Address.");
                        return false;
                    } else {
                        reqObj = {
                            contractABI: resp.contractABI,
                            contractAddress: tokenaddr.tokenAddress,
                            address: address,
                            account: account,
                            provider:library?.provider,
                            methodName: methodName

                        }
                        GassFeeCalculation(reqObj).then((finalGasInEther)=>{
                        setgassvalue(finalGasInEther);
                        tokenInst.methods.transferOwnership(address).send(
                            { from: account }, function (err, res) {

                                if (err) {
                                   
                                    toast.error(err.message);
                                }
                               
                                toast.success(res)
                            }
                        )
                    }).catch(ex=>{
                        toast.error("Invalid Contract Adddress For Change Owner")
                    })
                    }
                } else if (methodName == "renounceownership") {
                    reqObj = {
                        contractABI: resp.contractABI,
                        contractAddress: tokenaddr.tokenAddress,
                        account: account,
                        provider:library?.provider,
                        methodName: methodName

                    }
                    GassFeeCalculation(reqObj).then((finalGasInEther)=>{
                    setgassvalue(finalGasInEther);
                    tokenInst.methods.renounceOwnership().send(
                        { from: account }, function (err, res) {

                            if (err) {
                              
                                toast.error(err.message);
                            }
                           
                            toast.success(res)
                        }
                    )
                }).catch(ex=>{
                    toast.error("Invalid Contract Adddress For Renounce Owner")
                })
                } else if (methodName == "Pause") {
                    // toast.error("Pause is not in  Smart contract");
                    reqObj = {
                        contractABI: resp.contractABI,
                        contractAddress: tokenaddr.tokenAddress,
                        account: account,
                        provider:library?.provider,
                        methodName: methodName

                    }
                   
                    GassFeeCalculation(reqObj).then((finalGasInEther)=>{
                    setgassvalue(finalGasInEther);
                    tokenInst.methods.pause().send(
                        { from: account }, function (err, res) {

                            if (err) {
                               
                                toast.error(err.message);
                            } else {
                                setIspaused(!isPaused);
                            }
                           
                            toast.success(res)
                        }
                    )
                }).catch(ex=>{
                    toast.error("Invalid Contract Adddress For Pause")
                })
                } else if (methodName == "UnPause") {
                    reqObj = {
                        contractABI: resp.contractABI,
                        contractAddress: tokenaddr.tokenAddress,
                        account: account,
                        provider:library?.provider,
                        methodName: methodName

                    }
                    GassFeeCalculation(reqObj).then((finalGasInEther)=>{
                    setgassvalue(finalGasInEther);
                    tokenInst.methods.unpause().send(
                        { from: account }, function (err, res) {

                            if (err) {
                               
                                toast.error(err.message);
                            } else {
                                setIspaused(!isPaused);
                            }
                            
                            toast.success(res)
                        }
                    )
                }).catch(ex=>{
                    toast.error("Invalid Contract Adddress For Unpause")
                })
                } else if (methodName == "blacklistaddress") {
                    if (address == "") {
                        toast.error("Provide Address.");
                        return false;
                    } else {
                        reqObj = {
                            contractABI: resp.contractABI,
                            contractAddress: tokenaddr.tokenAddress,
                            address: address,
                            account: account,
                            provider:library?.provider,
                            methodName: methodName

                        }
                        GassFeeCalculation(reqObj).then((finalGasInEther)=>{
                        setgassvalue(finalGasInEther);
                        tokenInst.methods.addBlackList(address).send(
                            { from: account }, function (err, res) {

                                if (err) {
                                   
                                    toast.error(err.message);
                                }
                               
                                toast.success(res)
                            }
                        )
                    }).catch(ex=>{
                        toast.error("Invalid Contract Adddress For Blocklist Address")
                    })
                    }
                } else if (methodName == "changetokenlimit") {
                    toast.error("Change Token Address Limit is not in Smart contract");
                   
                } else if (methodName == "changetokenlimit") {
                    toast.error("Edit Asset Documentation is not in Smart contract");
                   
                }


            }
        } catch (ex) {
            console.log(ex);
        }

    }
    return (
        <>
            {tokenaddr &&
                <div className="w-full my-6 bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700 mx-auto">


                    <div className="intro-x text-center xl:text-left">
                        <div className="form-check  items-baseline mt-4">
                            <div className="flex flex-row">
                                <span className="w-3/10 mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Contract Address</span>
                                <span>:</span>
                                <span>{tokenaddr.tokenAddress}</span>
                            </div>
                            <div className="flex flex-row">
                                <span className="w-3/10  mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Token Name</span>
                                <span>:</span>
                                <span>{tokenaddr.tokenName}</span>
                            </div>
                            <div className="flex flex-row">
                                <span className="w-3/10 mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Token Supply
                                </span>
                                <span>:</span>
                                <span>{tokenaddr.tokenSupply}</span>
                            </div>
                            <div className="flex flex-row">
                                <span className="w-3/10 mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Owner</span>
                                <span>:</span>
                                <span>{tokenaddr.Owner}</span>
                            </div>
                            <div className="flex flex-row">
                                <span className="w-3/10 mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Approximate cost of operation
                                </span>
                                <span>:</span>
                                <span>{gassvalue} ETH</span>
                            </div>
                            <div className="flex flex-row">

                                <span className="w-3/10  text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Minter address
                                    <span className="text-red-600">*</span></span>
                                <span>:</span>
                                <input
                                    type="text"
                                    name="tokanAddress"
                                    id="tokanAddress"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="Minter address"
                                    onChange={(e) => {
                                        setaddress(e.currentTarget.value)
                                    }}
                                    required
                                />



                            </div>
                            <div className="flex flex-row mt-2">

                                <span className="w-3/10  text-sm font-medium text-gray-900 dark:text-gray-300">Amount
                                    <span className="text-red-600">*</span></span>
                                <span >:</span>
                                <input
                                    type="text"
                                    name="amount"
                                    id="amount"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="Amount"
                                    onChange={(e) => {
                                        setamount(e.currentTarget.value)
                                    }}
                                    required
                                />



                            </div>
                            {/* <div className="flex flex-row mt-2">

                        <span className="block  text-sm font-medium text-gray-900 dark:text-gray-300"><text className="text-red-500">*</text>Block Users </span>
                        <span className="ml-6 mr-4">:</span>
                        <input
                            type="text"
                            name="blockUsers"
                            id="blockUsers"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Block Users"
                            onChange={(e) => {
                                setblockUsers(e.currentTarget.value)
                            }}
                            required
                        />



                        </div> */}
                        <div className="flex flex-row justify-around">
                            <button type='submit' disabled={!isowner} className={`w-80  text-white font-bold py-2 px-2 rounded mt-9 sm:mr-2 ${!isowner ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 "}`} onClick={() => handleFunctionCalls("mint")} >
                                Mint
                            </button>
                            <button type='submit' disabled={!isowner} onClick={() => handleFunctionCalls("burn")} className={`w-80 text-white font-bold py-2 px-2 rounded mt-9 ${!isowner ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 "}`} >
                                Burn
                            </button>
                        </div>
                        <div className="flex flex-row justify-around">
                            <button type='submit' disabled={!isowner} onClick={() => handleFunctionCalls("changeowner")} className={`block w-80 text-white font-bold py-2 px-2 rounded mt-9  sm:mr-2 ${!isowner ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500"}`} >
                                Change Owner
                            </button>
                            <button type='submit' disabled={!isowner} onClick={() => handleFunctionCalls( isPaused ? "UnPause" :"Pause")} className={`block w-80  text-white font-bold py-2 px-2 rounded mt-9 ${!isowner ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 "}`} >
                           { isPaused ? "UnPause" :"Pause"}
                            </button>
                        </div>
                        <div className=" flex flex-row justify-around">
                            <button type='submit' disabled={!isowner} onClick={() => handleFunctionCalls("blacklistaddress")} className={`block w-80  text-white font-bold py-2 px-2 rounded mt-9  sm:mr-2 ${!isowner ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 "}`} >
                                Blacklist Address
                            </button>
                            <button type='submit' disabled={!isowner} onClick={() => handleFunctionCalls("renounceownership")} className={`block w-80 text-white font-bold py-2 px-2 rounded mt-9 ${!isowner ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 "}`} >

                                    Renounce Ownership
                                </button>
                            </div>
                            {/* <div className=" flex flex-row">

                            <button type='submit' onClick={() => handleFunctionCalls("changetokenlimit")} className="flex-col w-70 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded mt-9 mr-4" >
                                Change Tokens Per Address Limit
                            </button>
                            <button type='submit' onClick={() => handleFunctionCalls("editdocs")} className="flex-grow  w-70 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded mt-9" >
                                Edit Asset Documentation
                            </button>
                        </div> */}
                            <div className=" flex flex-row">
                                {/* <button type='submit' onClick={() => handleFunctionCalls("changeowner")} className="flex-grow  w-70 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded mt-9 mr-4" >
                                Add Liquidity Pool To DEX
                            </button> */}

                            </div>
                        </div>



                    </div>
                </div>}
        </>
    )
}
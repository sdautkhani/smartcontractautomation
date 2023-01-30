import React, { useState, useEffect } from 'react'
import FeatherIcon from "feather-icons-react";
import { Formik } from 'formik';
import { useWeb3React } from '@web3-react/core';
import ChangeNetwork from "../ChangeNetwork";
import { SaleEndFailIcon, AccessAlarmIcon } from '../../assets/SvgComponent';
import CountdownTimer from '../CountdownTimer';


import {
    USER_BASE_URL,
    globalService,
    TOKEN_SALE_DETAILS_URL,
    GET_CONTRACT_VALUE,
    Networks
} from "../../helpers";
import { faL } from '@fortawesome/free-solid-svg-icons';

const Web3 = require('web3');


export default function TokenSaleComponent(data) {

    const [networkSymbol, setNetworkSymbol] = useState(Networks[data.chainId].nativeCurrency.symbol);
 
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [tokenSaleDetails, setTokenSaleDetails] = useState();
    const [isSaleStart, setIsSaleStart] = useState(false);
    const [isSaleEnd, setIsSaleEnd] = useState(false);
    const [startTime, setStartTime] = useState(new Date().getTime());
    const [endTime, setEndTime] = useState(new Date().getTime());
    const [balance, setBalance] = useState(0);
    const [balanceFund, setBalanceFund] = useState(0);
    const [supplytoken, setSupplytoken] = useState('');
    const [isloadingBuy, setIsLoadingBuy] = useState(false);
    const [showPopup, setshowPopup] = useState(false);
    const { library, account, chainId } = useWeb3React();
    const web3 = new Web3(library?.provider);

    useEffect(() => {

        console.log("in setTimeout")
        //  if (user != undefined) {
        getTokenDetails();
        //}




    }, [data.tokenaddr])
    useEffect(() => {
        if (account != undefined && chainId != data.chainId) {
            setshowPopup(true);
        } else {
            setshowPopup(false);
        }

    }, [chainId])
    useEffect(() => {
        const interval = setInterval(() => {
            let timeDiff = startTime - new Date().getTime();
            console.log(timeDiff);
            if (timeDiff <= 0) {
                setIsSaleStart(true);
                timeDiff=endTime-new Date().getTime();
                if(timeDiff<=0){
                    setIsSaleEnd(true);
                    clearInterval(interval);
                }
                else{
                    setIsSaleEnd(false);
                }
               
            } else {
                setIsSaleStart(false);
            }
            return () => clearInterval(interval);
        }, 1000);

    }, [])
    const getTokenDetails = async () => {

        let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsX2lkIjpudWxsLCJyb2xlIjoidXNlcnMiLCJ1c2VyTmFtZSI6IjB4MDFmNGU5Q2VGNDEzOEE4N2Y0YTI0MDIzYkFBYWUwMDcyOWIzMjE4NSJ9LCJpYXQiOjE2Njg1ODk5MjIsImV4cCI6MTY2ODY3NjMyMn0.FVVNkcmQtKShKy_RdWDorIBnrXEkEjLp4nkOG9SFDZ0';
        let reqObj = {
            method: "GET",
            headers: { "authorization": `Bearer ${token}` },
            url: `${USER_BASE_URL}/${TOKEN_SALE_DETAILS_URL}/${(data.tokenaddr).toLowerCase()}`,

        };

        const resp = await globalService(reqObj);
        if (resp != null) {

            setTokenSaleDetails(resp);
            let Starttemp = new Date(resp.startDate);
            let Endtemp = new Date(resp.endDate);

            setStartTime(Starttemp.getTime());
            setEndTime(Endtemp.getTime());
        }

        try {
            let reqObj = {
                method: "GET",
                headers: { "authorization": `Bearer ${user.token}` },
                url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,

            };

            var contractResp = await globalService(reqObj);
            if (resp != null) {

                const tokenInst = new web3.eth.Contract(contractResp.contractABI, data.tokenaddr);
                let balanceToken = await tokenInst.methods.tokenLeft().call();
                let balanceFunds = await tokenInst.methods.checkTokenPrice().call();
                let supply = await tokenInst.methods.supply().call();
                setSupplytoken(supply);
                setBalance(balanceToken);
                setBalanceFund(balanceFunds);

            }
        } catch (ex) {
            console.log(ex);

        }
    }
    const addMetamask = () => {
        library?.provider.sendAsync({
            method: 'metamask_watchAsset',
            params: {
                "type": "ERC20",
                "options": {
                    "address": tokenSaleDetails.contractAddress,
                    "symbol": tokenSaleDetails.tokenSymbol,
                    "decimals": 18,
                    "image": "",
                },
            },
            id: Math.round(Math.random() * 100000),
        }, (err, added) => {
            console.log('provider returned', err, added)
            if (err || 'error' in added) {
                console.log(err);
                return
            }
            console.log("Token Added")
        })
    }
    const LabelValueComponent = ({ label, value, showEdit, type = '' }) => {

        return (

            <div className='grid grid-cols-3 border-t border-gray-100'>

                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{`${label}  :`}</span>

                {showEdit ?

                    <div className='flex flex-row items-center'>

                        <span className="text-sm font-medium text-gray-500 dark:text-gray-300" >{value}</span>
                        <a href='#' className='text-blue-500' onClick={() => { setUpdate(type) }}>
                            <FeatherIcon icon="edit" size="18px" className="text-blue-500"></FeatherIcon>
                        </a>
                    </div>

                    : <span className="text-sm font-medium text-gray-500 dark:text-gray-300" >{value}</span>}

            </div>

        )

    }
    const handleSubmit = async (values) => {

        const user = JSON.parse(sessionStorage.getItem("user"));

        let reqObj = {
            method: "GET",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,

        };

        var resp = await globalService(reqObj);
        if (resp != null) {
            try {
                const tokenInst = new web3.eth.Contract(resp.contractABI, tokenSaleDetails.tokenAddress);
                tokenInst.methods.buy(values.tokenNo).send({
                    from: account
                }
                ).on('transactionHash', function (hash) {
                    console.log(hash);
                    //    setTxhash(hash);
                    //    setLoading(false);
                })
                    .on('error', function (error) {
                        console.log(error);
                        //  setTxhash("");
                        //  setLoading(false);

                    });
            } catch (ex) {
                console.log(ex);
            }
        }

    }
    const validation = (values) => {

    }
    const refund = async () => {

       // setLoading(true);
        let reqObj = {
            method: "GET",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,

        };
        const resp = await globalService(reqObj);

        if (resp != null) {
            const tokenInst = new web3.eth.Contract(resp.contractABI, tokenSaleDetails.contractAddress);
          
                tokenInst.methods.withdraw().send({
                    from: account, maxPriorityFeePerGas: null,
                    maxFeePerGas: null
                }, function (err, res) {
                    if (err) {
                        console.log(err);

                    } else {
                        console.log(res);

                    }

                   // setLoading(false);
                }
                )

            
        }

    };

    return (
        <>
            <ChangeNetwork />
            {tokenSaleDetails &&

                <div className='w-full  flex flex-col justify-center md:flex-row'>
                    <div className="w-3/4 md:full mt-5 p-4 bg-white rounded-lg border border-gray-200 shadow-md sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700 ">
                        <h5 className="text-center text-2xl font-medium text-gray-900 dark:text-white">{tokenSaleDetails.tokenName} ({tokenSaleDetails.tokenSymbol})  Token Sale</h5>
                        <h6 className="text-center text-sm font-medium text-gray-300 dark:text-white">{tokenSaleDetails.tokenAddress}</h6>

                        <div className='pt-6'>
                            {isSaleStart ?
                               (balance == 0 || isSaleEnd) ? <div className='flex flex-col items-center'>
                                
                                    <SaleEndFailIcon />
                                   { isSaleEnd ? <p className='text-xl font-medium mt-3'>Sale ended</p>
                                    :<p className='text-xl font-medium mt-3'>Sale failed</p>}
                                </div>
                                    :
                                    <div className='flex flex-col items-center'>
                                        <div className='flex flex-row items-center'>
                                            <div>
                                                <AccessAlarmIcon />
                                            </div>
                                            <div>
                                                <span className='block text-xl font-medium py-4'>Sale ends in</span>
                                            </div>
                                        </div>

                                        <CountdownTimer targetDate={endTime}></CountdownTimer>
                                    </div>
                                :
                                <div className='flex flex-col items-center'>
                                    <div className='flex flex-row items-center'>
                                        <div>
                                            <AccessAlarmIcon />
                                        </div>
                                        <div>
                                            <span className=' block text-xl font-medium py-4'>Sale starts in</span>
                                        </div>
                                    </div>

                                    <CountdownTimer targetDate={startTime}></CountdownTimer>
                                </div>}

                        </div>
                        <div className='pt-10 flex flex-row justify-between'>
                            <div className='flex flex-row'>
                                <FeatherIcon icon="check-circle" size="18px" className="text-yellow-500" ></FeatherIcon>
                                <p className=" block ml-3 text-sm font-medium text-gray-500 dark:text-gray-500">
                                    {tokenSaleDetails.tokenSymbol}  {balance} remaining
                                </p>
                            </div>

                            <div className='flex flex-row ml-12 pl-12'>
                                <FeatherIcon icon="activity" size="20px" className="text-yellow-500" ></FeatherIcon>
                                <p className=" block ml-3 text-sm font-medium text-gray-500 dark:text-gray-300">
                                    Sale rate: 1 {networkSymbol} = {tokenSaleDetails.saleRate == 0 ? 'X' : tokenSaleDetails.saleRate}  {tokenSaleDetails.tokenSymbol}
                                </p>
                            </div>
                        </div>
                        <div className=' w-full my-2 p-2 bg-gray-100 flex justify-end'>
                            <p className='text-sm font-medium'>  {tokenSaleDetails.tokenSymbol} {balance}</p>
                        </div>
                        <div className="form-check flex items-baseline mt-4">
                            <div>

                                {(isSaleStart && balance!=0) &&
                                    <Formik
                                        initialValues={{ tokenNo: "" }}
                                        validate={(values) => validation(values)}
                                        onSubmit={(values, { setSubmitting, setFieldValue }) => handleSubmit(values)} >
                                        {
                                            ({
                                                values,
                                                errors,
                                                touched,
                                                setFieldValue,
                                                handleChange,
                                                handleBlur,
                                                handleSubmit,
                                                isValid,
                                                dirty
                                            }) =>
                                            (
                                                <form onSubmit={handleSubmit} onChange={(e) => { }}>
                                                    <div className=''>


                                                        <div className='flex justify-center items-center'>

                                                            <input
                                                                type="number"
                                                                name="tokenNo"
                                                                id="tokenNo"
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white mr-3"
                                                                placeholder="Enter  No. Of Tokens"
                                                                onBlur={handleBlur}
                                                                value={values.tokenNo}
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                required
                                                            />

                                                            {errors.tokenNo && touched.tokenNo && (
                                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.tokenNo}</div>
                                                            )}
                                                        </div>

                                                        <div className='flex justify-center items-center flex-row'>
                                                            {isloadingBuy ? <div className="cover-spin flex justify-center items-center">

                                                                <Loader type={'spinningBubbles'} color="#ed8936">

                                                                </Loader>

                                                            </div>
                                                                :

                                                                <button disabled={!(dirty && isValid)} className={`w-40 py-2 px-2 mr-4 my-5 rounded text-white h-10 ${!(dirty && isValid) ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500"}`}>
                                                                    Buy
                                                                </button>
                                                            }


                                                        </div>


                                                    </div>
                                                </form>
                                            )
                                        }
                                    </Formik>
                                }
                                {isSaleEnd &&<div className='flex flex-col justify-center items-center'>
                                    <div className='flex flex-row'>
                                         <FeatherIcon icon="activity" size="20px" className="text-yellow-500" />Available refund : {balanceFund}
                                        </div>
                                         <button onClick={(e) => { refund() }}
                                        type='submit' disabled={balanceFund==0}
                                        className={`w-40 py-2 px-2 mr-4 my-5  hover:bg-orange-800 text-white font-bold ${(balanceFund==0) ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500"}`}
                                    >
                                        Claim refund

                                    </button>
                                    </div>
                                }

                                <LabelValueComponent label='Total token supply' showEdit={false} value={supplytoken} />
                                <LabelValueComponent label='Number of tokens on sale' showEdit={false} value={tokenSaleDetails.tokenSymbol + " " + tokenSaleDetails.tokenOnSale} />

                                <LabelValueComponent label='Price per token' showEdit={false} value={"1 " + networkSymbol + " = " + tokenSaleDetails.saleRate + " " + tokenSaleDetails.tokenSymbol} />
                                {tokenSaleDetails.selectedPayment == "custom" &&
                                    <LabelValueComponent label='Payment token' showEdit={false} value={tokenSaleDetails.contractAddress} />
                                }
                                {tokenSaleDetails.selectedPayment == "custom" &&
                                    <LabelValueComponent label='Payment Token Address' showEdit={false} value={tokenSaleDetails.contractAddress} />
                                }

                                <LabelValueComponent showEdit={false} label={'Soft cap in ' + tokenSaleDetails.tokenSymbol} value={tokenSaleDetails.softCap} />


                                <LabelValueComponent showEdit={false} label={'Hard cap in ' + tokenSaleDetails.tokenSymbol} value={tokenSaleDetails.hardCap} />


                                <LabelValueComponent showEdit={false} label='Token sale owner address' value={tokenSaleDetails.ownerAddress} />
                                <hr />
                                <h5 className="text-center text-xl font-medium text-gray-900 dark:text-white py-3">General settings</h5>
                                <LabelValueComponent showEdit={false} label={"Min investment amount in " + tokenSaleDetails.tokenSymbol} value={tokenSaleDetails.minInvest} />

                                <LabelValueComponent showEdit={false} label={"Max investment amount in " + tokenSaleDetails.tokenSymbol} value={tokenSaleDetails.maxInvest} />

                                <LabelValueComponent showEdit={false} label='Token sale start time' value={tokenSaleDetails.startDate} />
                                <LabelValueComponent showEdit={false} label='Token sale end time' value={tokenSaleDetails.endDate} />
                                <LabelValueComponent showEdit={false} label='Token sale lock time' value={tokenSaleDetails.claimDate} />
                                <LabelValueComponent showEdit={false} label='Investor whitelist' value={tokenSaleDetails.addressType} />


                                <div className='flex justify-center items-center'>
                                    <button onClick={(e) => { addMetamask() }}
                                        type='submit'
                                        className={`w-3/5 bg-orange-500 hover:bg-orange-800 text-white font-bold py-2 px-4 rounded mt-9 bg-orange-500}`}
                                    >
                                        Add to Metamask

                                    </button>
                                </div>
                            </div>
                        </div>







                    </div>
                </div>

            }
            {showPopup &&

                <div class=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full">
                    <div class="relative p-4 w-full h-full bg-transparent">
                        <div class="flex justify-center items-center relative w-1/2 left-1/4 top-1/4 right-1/4 bg-white rounded-lg shadow bg-white">

                            <div class="p-6 text-center">
                                <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>

                                <div>
                                    {account == undefined ?
                                        <div>
                                            To see this token sale you need to connect wallet first
                                        </div>
                                        :
                                        <div>
                                            This token sale is available on {Networks[data.chainId].chainName}. Please change network in your wallet.
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

        </>
    )
}
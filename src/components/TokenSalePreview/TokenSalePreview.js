import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import Loader from 'react-loading';
import { useWeb3React } from '@web3-react/core';
import {
    USER_BASE_URL,
    globalService,
    CREATE_TOKEN_SALE_URL,
    GET_CONTRACT_VALUE
} from "../../helpers";
const Web3 = require('web3');


export default function TokenSalePreview(data) {
    const { library, account,chainId } = useWeb3React();
    const web3 = new Web3(library?.provider);
    const navigate = useNavigate();
    const btnRef = useRef();
    const [checked, setChecked] = useState(false);
    const [isloading, setLoading] = useState(false);
    const [summery, setSummery] = useState(tokenSaleDetails);
    const [showError, setShowError] = useState(false);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const tokenSaleDetails=data.tokenSaleDetails;
  
    const addToken = async (event) => {
        if (btnRef.current) {
            btnRef.current.setAttribute("disabled", true);
        }
        setLoading(!isloading);

        if (user.isMetamask) {
           

            let reqObj = {
                method: "GET",
                headers: { "authorization": `Bearer ${user.token}` },
                url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,

            };
            const resp = await globalService(reqObj);

            if (resp != null) {
                let tempStartTime=new Date(tokenSaleDetails["startDate"]);
                let startTime=tempStartTime.getTime();
                let tempEndTime=new Date(tokenSaleDetails["startDate"]);
                let endTime=tempEndTime.getTime();
                
                let reqObj = [
                    tokenSaleDetails["tokenAddress"],
                    tokenSaleDetails["paymentAddress"],
                    tokenSaleDetails["saleRate"],
                    tokenSaleDetails["tokenOnSale"],
                    
                    tokenSaleDetails["minInvest"],
                    tokenSaleDetails["maxInvest"],
                    startTime,
                    endTime
                  
                ];
                console.log(reqObj);
                var deployResp = await deploy(reqObj, resp);
                tokenSaleDetails["txHash"] = deployResp.data.transactionHash;
                tokenSaleDetails["contractAddress"] = (deployResp.data.contractAddress).toLowerCase();
                tokenSaleDetails["reason"] = deployResp.error != null ? deployResp.error.message : deployResp.error;
                if (deployResp.error != null) {
                    tokenSaleDetails["status"] = "Pending";
                } else {
                    tokenSaleDetails["status"] = "Deployed";
                }
                tokenSaleDetails["deployViaMetamask"] = true;
            }
        } else {
            tokenSaleDetails["status"] = "Pending";
            tokenSaleDetails["deployViaMetamask"] = false;
        }
      //  tokenDetails["tokenStandard"] = "ERC20";
      tokenSaleDetails["chainId"] =chainId;
        var tempdata = tokenSaleDetails;
        var config = {
            method: "POST",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${CREATE_TOKEN_SALE_URL}`,
            data: { ...tempdata },
        };

        try {

            const resp = await globalService(config);
            if (resp.status == 0) {
                sessionStorage.clear();
                navigate("/");
            } else {
                setLoading(false);
                btnRef.current.removeAttribute("disabled", true);
                if (resp.status == '2') {
                    toast.error(resp.msg);
                } else {
                    if (deployResp && deployResp.error != null) {
                        toast.error(resp.msg);
                    } else {
                        toast.success(resp.msg);
                    }
                   
                    navigate("/tokenList");

                    
                }

            }

        } catch (err) {
            setLoading(false);
            toast.error("Token Creation Fail!")
        }

    };
    const deploy = async (tokenObj, rowContract) => {
        return new Promise(async (resolve, reject) => {
            var returnData = {};
            try {
              
                const incrementer = new web3.eth.Contract(rowContract.contractABI);

                const incrementerTx = await incrementer.deploy({
                    data: rowContract.byteCode,
                    arguments: tokenObj
                });
                const gaslimit = await incrementer.deploy({
                    data: rowContract.byteCode,
                    arguments: tokenObj
                }).estimateGas({ from: account });

                let gasprice = await web3.eth.getGasPrice();

                var txHash = "";
                web3.eth.sendTransaction({
                    from: account,
                    data: incrementerTx.encodeABI(),
                    gas: gaslimit,
                    gasprice: gasprice
                })
                    .on('transactionHash', function (hash) {
                        txHash = hash;
                    })
                    .on('receipt', function (receipt) {
                        returnData = { "data": receipt, "error": null };
                        resolve(returnData);
                    })
                    .on('error', function (error) {
                        returnData = { "data": null, "error": ex };
                        reject(returnData);

                    });
            } catch (ex) {
                returnData = { "data": null, "error": ex };
                reject(returnData);
            }
        })
    };
    const LabelValueComponent = ({ label, value }) => {
        return (
            <div className='grid grid-cols-3'>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{`${label}  :`}</span>
            
                <span className="text-sm font-medium text-gray-500 dark:text-gray-300" >{value}</span>
            </div>
        )
    }

    return (
        <>
            {tokenSaleDetails &&

                <div className='w-full ml-20 flex flex-col md:flex-row'>
                    <div className="w-3/4 md:full mt-5 p-4 bg-white rounded-lg border border-gray-200 shadow-md sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700 ">
                    <h6 className="text-center text-l font-medium text-gray-400 dark:text-white">Step 2 of 2: Review token sale configuration</h6>
                        <div className="form-check flex items-baseline mt-4">
                            <div>
                                <LabelValueComponent label='Token' value={tokenSaleDetails.symbol} />
                                <LabelValueComponent label='Token Address' value={tokenSaleDetails.tokenAddress} />
                               
                                <LabelValueComponent label='Total token supply' value={tokenSaleDetails.supply} />
                                <LabelValueComponent label='Number of tokens on sale' value={tokenSaleDetails.symbol+" "+tokenSaleDetails.tokenOnSale} />
                                
                                <LabelValueComponent label='Price per token' value={"1 "+tokenSaleDetails.networkSymbol+" = "+ tokenSaleDetails.saleRate+" "+tokenSaleDetails.symbol} />
                               { tokenSaleDetails.selectedPayment=="custom"&& 
                               <LabelValueComponent label='Payment token Address' value={tokenSaleDetails.paymentAddress} />
                               }
                                { tokenSaleDetails.selectedPayment=="custom"&& 
                                 <LabelValueComponent label='Payment Token Symbol' value={tokenSaleDetails.paymentSymbol} />
                                 }
                                <LabelValueComponent label={'Soft cap in '+tokenSaleDetails.symbol} value={tokenSaleDetails.softCap} />
                                <LabelValueComponent label={'Hard cap in '+tokenSaleDetails.symbol} value={tokenSaleDetails.hardCap} />

                                <LabelValueComponent label={"Min investment amount in "+tokenSaleDetails.symbol} value={tokenSaleDetails.minInvest} />
                                <LabelValueComponent label={"Max investment amount in "+tokenSaleDetails.symbol} value={tokenSaleDetails.maxInvest} />
                                <LabelValueComponent label='Token sale start time' value={tokenSaleDetails.startDate} />
                                <LabelValueComponent label='Token sale end time' value={tokenSaleDetails.endDate} />
                                <LabelValueComponent label='Token sale lock time' value={tokenSaleDetails.claimDate} />
                                <LabelValueComponent label='Investor whitelist' value={tokenSaleDetails.addressType} />
                                <LabelValueComponent label='Token sale owner address' value={tokenSaleDetails.ownerAddress} />
                              
                            </div>

                        </div>
                        {showError && <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">Fill All Required Details.</div>}
                            {isloading ? <div className="cover-spin flex justify-center items-center">

                                <Loader type={'spinningBubbles'} color="#ed8936">

                                </Loader>

                            </div>
                                :
                                <button ref={btnRef} onClick={addToken}
                                    type='submit'
                                    className={`w-full bg-orange-500 hover:bg-orange-800 text-white font-bold py-2 px-4 rounded mt-9 bg-orange-500}`}
                                >
                                    Confirm

                                </button>
                            }
                    </div>

                    {/* <div className='w-full mt-2 md:mt-0 md:w-1/2'>
                      

                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-md sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700">
                           
                          
                        </div>
                    </div> */}
                </div>

            }

        </>
    )
}
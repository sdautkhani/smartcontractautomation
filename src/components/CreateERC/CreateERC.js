import React, { useState } from 'react';
import Loader from 'react-loading';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SelectDateTime from "../SelectDateTime";
import { useWeb3React } from '@web3-react/core';
import moment from 'moment-js';
import {
    USER_BASE_URL,
    globalService,
    GET_CONTRACT_VALUE,
    CREATE_NFT_URL,
    WEB3_STORAGE_CLIENT
} from "../../helpers";
const Web3 = require('web3');
var tokenDetails = {};

export default function CreateERC(tokenStandard) {

    const navigate = useNavigate();
    const [isPublicMint, setPublicMint] = useState(false);
    const [isloading, setLoading] = useState(false);
    const [isFileloading, setFileLoading] = useState(false);
    const [isDisabledBtn, setisDisabledBtn] = useState(true);
    const [submitted, setSubmitValue] = useState(false);
    const [formError, setFormError] = useState({});
    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(moment());
    const { library, account } = useWeb3React();
    const web3 = new Web3(library?.provider);

    const user = JSON.parse(sessionStorage.getItem("user"));
    const onInputChange = async (e, key) => {
        if (key !== 'startTime' && key !== 'endTime') {
            if (key == "isPublicMint") {
                setPublicMint(e.target.checked);
                tokenDetails[key] = e.target.checked;
            } else {
                const { value } = e.currentTarget;
                tokenDetails[key] = value;
            }
        }
        setSubmitValue(true);
        setFormError(validate(tokenDetails));
    }

    const validate = (values) => {
        let alp_regex = new RegExp('[a-zA-Z]');
        let errors = {};
        if (!values.name) {
            errors.name = 'Token Name Required';
        }

        if (!values.symbol) {
            errors.symbol = 'Token Symbol Required';
        } else if ((values.symbol).toString().length >= 6) {
            errors.symbol = "Token Symbol should contain max 5 characters"
        } else if (!alp_regex.test(values.symbol)) {
            errors.symbol = "Token Symbol should contain alphabets Only"
        }

        if (!values.description) {
            errors.description = 'Description Required';
        } else if ((values.description).toString().length >= 500) {
            errors.description = "Description should contain max 500 characters"
        }

        if (!values.mintPrice) {
            errors.mintPrice = 'Mint Price Required';
        } else if (values.mintPrice < 0) {
            errors.mintPrice = 'Mint Price Should Not Be Less Than Zero';
        }

        if (!values.amountPerUser) {
            errors.amountPerUser = 'Max Token Mint Amount Per User Required';
        } else if (!values.amountPerUser < 0) {
            errors.amountPerUser = 'Max Token Mint Amount Per User Should Not Be Less Than Zero';
        }

        if (!values.maxAmount) {
            errors.maxAmount = 'Global Max Token Amount Required';
        } else if (values.maxAmount < 0) {
            errors.maxAmount = 'Global Max Token Amount  Should Not Be Less Than Zero';
        }

        let starteD = new Date(startDate);
        let endD = new Date(endDate);
        let diffTime = (endD - starteD);

        if (starteD !== undefined && endD !== undefined) {
            if (diffTime < 0) {
                errors.endDate = 'End Time Can Not Be Less Than Start Time'
            }
        }
        if (Object.keys(errors).length === 0) {
            setisDisabledBtn(false)
        } else {
            setisDisabledBtn(true)
        }
        return errors;
    }

    const addToken = async (event) => {
        setLoading(!isloading);
        if (moment(startDate) != undefined) {
            tokenDetails["startTime"] = moment(startDate).toString();
        }
        if (moment(endDate) != undefined) {
            tokenDetails["endTime"] = moment(endDate).toString();
        }
        tokenDetails["isPublicMint"] = isPublicMint
        tokenDetails["tokenStandard"] = tokenStandard.tokenStd;
      //  let tokenType = tokenStandard.tokenStd === 'ERC1155' ? 'erc1155' : tokenStandard.tokenStd === 'ERC721' ? 'erc721' : ''
        if (user.isMetamask) {
            let reqObj = {
                method: "GET",
                headers: { "authorization": `Bearer ${user.token}` },
                url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/${tokenStandard.tokenStd}`,
            };

            const resp = await globalService(reqObj);

            if (resp != null) {
                tokenDetails["userName"] = user.username,
                    tokenDetails["deployViaMetamask"] = true;
                deploy(tokenDetails, resp).then((deployResp) => {

                    tokenDetails["txHash"] = deployResp.hash;
                    tokenDetails["contractAddress"] = deployResp.contractAddress;
                    tokenDetails["reason"] = deployResp.error != null ? deployResp.error.message : deployResp.error;
                    if (deployResp.error != null) {
                        tokenDetails["status"] = "Pending";
                    } else {
                        tokenDetails["status"] = "Deployed";
                    }

                    saveTokenDetails(tokenDetails, deployResp);
                }).catch(ex => {
                    tokenDetails["status"] = "Pending";
                    tokenDetails["reason"] = ex.error.message;
                    saveTokenDetails(tokenDetails, ex);
                })
            }
        } else {
            tokenDetails["status"] = "Pending";
            tokenDetails["deployViaMetamask"] = false;
            tokenDetails["userName"] = user.username,
                saveTokenDetails(tokenDetails);
        }



    };

    const saveTokenDetails = async (tokenDetails, deployResp) => {
        var tempdata = tokenDetails;
        var config = {
            method: "POST",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${CREATE_NFT_URL}`,
            data: { ...tempdata },
        };

        try {
            const resp = await globalService(config);
            if (resp.status == 0) {
                sessionStorage.clear();
                navigate("/");
            } else {
                setLoading(false);

                if (resp.status == '2') {
                    toast.error(resp.msg);
                } else {
                    if (deployResp.error != null) {
                        let msg = "Token Created with deployment pending due to " + deployResp.error.message;
                        toast.error(msg);
                    } else {
                        let msg = "Token Created With Contract Address " + tokenDetails["contractAddress"];
                        toast.success(msg);
                    }
                    navigate("/tokenList");
                }
            }

        } catch (err) {
            setLoading(false);
            toast.error("Token Creation Fail!")
          
        }
    }

    const deploy = async (tokenObj, rowContract) => {
        return new Promise(async (resolve, reject) => {
            var returnData = {};
            try {
                var deploymentArg=[];

                // if(tokenStandard.tokenStd=="erc1155"){
                //     deploymentArg=["bzz-raw://16913101c3d3f5bf6635a06ac867376e192077aadaeda13cd0f445b687f2153b"];
                // }
                console.log(web3);
                const incrementer = new web3.eth.Contract(rowContract.contractABI);
                console.log(deploymentArg);
                const incrementerTx = await incrementer.deploy({
                    data: rowContract.byteCode,
                    arguments: deploymentArg
                });
                const gaslimit = await incrementer.deploy({
                    data: rowContract.byteCode,
                    arguments: deploymentArg
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
                        returnData = { "hash": receipt.transactionHash, "contractAddress": receipt.contractAddress, "error": null };
                        resolve(returnData);
                    })
                    .on('error', function (error) {
                        returnData = { "hash": "txHash", "contractAddress": "", "error": error };
                        reject(returnData);

                    });
            } catch (ex) {
                returnData = { "data": null, "error": ex };
                reject(returnData);
            }
        })
    };

    const onChangeImage = (e) => {
        setFileLoading(true)
        const files = e.target.files
        try {

            WEB3_STORAGE_CLIENT.put(files).then(rootCid => {
                const url = `https://${rootCid}.ipfs.w3s.link/${files[0].name}`
                tokenDetails["imgUrl"] = url;
                setFileLoading(false)
            }).catch(error => {
                setFileLoading(false)
            });
        } catch (error) {
            setFileLoading(false)
        }

    }

    return (
        <>
            <div className="flex md:flex-row flex-col">
                <div className="w-50 md:w-full mt-5 bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700">
                    <h5 className="text-center text-xl font-medium text-gray-900 dark:text-white">General Information</h5>
                    <br />
                    <div>
                        <input
                            type="file"
                            name="file"
                            onChange={onChangeImage}
                            style={{ display: "block", margin: "10px auto" }}
                        />
                        {isFileloading && <div className="cover-spin flex justify-center items-center">
                            <Loader type={'spinningBubbles'} color="#ed8936" />
                        </div>}
                    </div>
                    <div className='flex justify-center'>
                        <span>OR</span>
                    </div>

                    <div>
                        <input
                            type="text"
                            name="imgUrl"
                            id="imgUrl"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Enter Image URL"
                            onChange={(e) => {
                                onInputChange(e, "imgUrl")
                            }}
                            required
                        />
                    </div>

                    <div>

                        <label for="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Name<span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Enter Token Name "
                            onChange={(e) => {
                                onInputChange(e, "name")
                            }}
                            required
                        />
                        <p className='my-1 clear-both text-xs text-gray-400'>Choose a name for your token.</p>
                        {submitted && formError.name && (
                            <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{formError.name}</div>
                        )}

                    </div>
                    <div>

                        <label for="symbol" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Symbol<span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            name="symbol"
                            id="symbol"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Enter Token Symbol "
                            onChange={(e) => {
                                onInputChange(e, "symbol")
                            }}
                            required
                        />
                        <p className='my-1 clear-both text-xs text-gray-400'>Choose a symbol for your token.</p>
                        {submitted && formError.symbol && (
                            <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{formError.symbol}</div>
                        )}

                    </div>
                    <div>

                        <label for="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Description<span className="text-red-600">*</span></label>
                        <textarea
                            type="text"
                            name="description"
                            id="description"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Enter Token Description "
                            onChange={(e) => {
                                onInputChange(e, "description")
                            }}
                            required
                        />
                        <p className='my-1 clear-both text-xs text-gray-400'>Insert description of Token (Maximum 500 chars) </p>
                        {submitted && formError.description && (
                            <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{formError.description}</div>
                        )}

                    </div>


                </div>
                {/* <div className="row-span-1 md:col-span-1 w-full my-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700 mx-auto"> */}
                <div className="w-50 md:mx-3 md:w-full mt-5 bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700">
                    <h5 className="text-center text-xl font-medium text-gray-900 dark:text-white">Other Settings</h5>

                    <br />

                    <div className="flex flex-col my-1">
                        <div className="form-check form-switch pl-0">
                            <input

                                className="ml-0 form-check-input appearance-none w-9 mr-3 rounded-full float-left h-5 align-top bg-white bg-no-repeat bg-contain bg-gray-300 focus:outline-none cursor-pointer shadow-sm"
                                type="checkbox"
                                role="switch"
                                id="flexSwitchCheckChecked"
                                checked={isPublicMint}
                                onChange={(e) => {
                                    onInputChange(e, "isPublicMint")
                                }} />
                            <label className="clear-both form-check-label inline-block text-gray-800" for="flexSwitchCheckChecked">
                                Enable Public Minting
                            </label>
                        </div>
                        <p className='my-1 clear-both text-xs text-gray-400'>Only the Token creator can mint. Enable if you want to allow minting of this Token for everybody.</p>
                    </div>



                    <div>

                        <label for="startTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Start Time</label>

                        <SelectDateTime setDateTime={setStartDate} onTimeChange={(e) => { onInputChange(e, "startTime") }} />
                        <p className='my-1 clear-both text-xs text-gray-400'>Start time from when this Token can be minted. If empty, there is no time limit.</p>
                        {/* {tokenerror != "" && <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{tokenerror}</div>} */}

                    </div>
                    <div>

                        <label for="endTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            End Time</label>

                        <SelectDateTime setDateTime={setEndDate} onTimeChange={(e) => { onInputChange(e, "endTime") }} />
                        <p className='my-1 clear-both text-xs text-gray-400'>End time until when this Token can be minted. If empty, there is no time limit.</p>
                        {submitted && formError.endDate && (
                            <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{formError.endDate}</div>
                        )}
                    </div>

                    <div>

                        <label for="mintPrice" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Mint Price<span className="text-red-600">*</span></label>
                        <input
                            type="Number"
                            name="mintPrice"
                            id="mintPrice"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="e.g 0.001"
                            onChange={(e) => {
                                onInputChange(e, "mintPrice")
                            }}
                            required
                        />
                        <p className='my-1 clear-both text-xs text-gray-400'>This is the price to mint one Token. If the price is set to 0, minting is free. Fees are transferred directly to the creator's wallet, Token Tool does not save funds!</p>
                        {submitted && formError.mintPrice && (
                            <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{formError.mintPrice}</div>
                        )}

                    </div>
                    <div>

                        <label for="amountPerUser" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Max Tokens Mint Amount Per User<span className="text-red-600">*</span></label>
                        <input
                            type="Number"
                            name="amountPerUser"
                            id="amountPerUser"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder=""
                            onChange={(e) => {
                                onInputChange(e, "amountPerUser")
                            }}
                            required
                        />
                        <p className='my-1 clear-both text-xs text-gray-400'>Maximum amount that can be minted per user or creator of this Token. If set to 0, there is no limit.</p>
                        {submitted && formError.amountPerUser && (
                            <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{formError.amountPerUser}</div>
                        )}

                    </div>

                    <div>

                        <label for="maxAmount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Global Max Mint Amount<span className="text-red-600">*</span></label>
                        <input
                            type="Number"
                            name="maxAmount"
                            id="maxAmount"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder=""
                            onChange={(e) => {
                                onInputChange(e, "maxAmount")
                            }}
                            required
                        />
                        <p className='my-1 clear-both text-xs text-gray-400'>This is the global total maximum supply of this token. If set to 0, there is no limit.</p>
                        {submitted && formError.maxAmount && (
                            <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{formError.maxAmount}</div>
                        )}

                    </div>
                    {isloading ? <div className="cover-spin flex justify-center items-center">

                        <Loader type={'spinningBubbles'} color="#ed8936" />

                    </div> :
                        <button disabled={isDisabledBtn} onClick={(e) => addToken()} className={`w-full rounded text-white h-10 ${isDisabledBtn ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500"}`}>Create Token</button>}
                </div>

            </div>
        </>
    )

}
import React, { useEffect, useRef, useState } from 'react';
import FeatherIcon from "feather-icons-react";
import Papa from "papaparse";
import { useWeb3React } from '@web3-react/core';
import {CreateTokenIcon} from '../../assets/SvgComponent';
import NumberedTextArea from '../NumberedTextArea';
import SwitchNetworkButtons from '../SwitchNetworkButtons'
import Loader from 'react-loading';
import {
    USER_BASE_URL,
    globalService,
    GET_CONTRACT_VALUE
} from "../../helpers";
const Web3 = require('web3');


export default function DistributeNFTComponent({ setFinalTokenList, setContractAddress }) {
    const { library, account, chainId } = useWeb3React();
    const web3 = new Web3(library?.provider);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const fileUploader = useRef(null);
    const [tokenList, setTokenList] = useState("");
    const [error, setError] = useState("");
    const [tokenerror, settokenerror] = useState("");
    const [tokenAddress, setTokenAddress] = useState("");
    const [istxtloading, settxtLoading] = useState(false);
    const [isBtnDisable, setisBtnDisable] = useState(true);
    const [isloading, setLoading] = useState(false);
    const [fileUpload, setFileUpload] = useState(false);
    const [isERC721Selected, setIsERC721Selected] = useState(true);
    const [fileData, setFileData] = useState([]);
    const [uploadedData, setUploadedData] = useState("");
    const handleUpload = () => {
        fileUploader.current.click();
    };

    useEffect(() => {

        if (error == "" && tokenerror == "" && tokenList.length > 2 && tokenAddress != "") {
            setisBtnDisable(false);
        }
    }, [error, tokenerror, tokenList, tokenAddress])

    const uploadFile = async (event) => {
        event.preventDefault();
        setLoading(!isloading);
        Papa.parse(event.target.files[0], {
            header: false,
            skipEmptyLines: true,
            complete: function (results) {
                const finalTokens = [];
                setError("");
                setFileUpload(true);
                let contractAddress_regex = new RegExp('0x[a-fA-F0-9]{40}$');
                // Iterating data to get column name and their values
                if (Object.keys(results.data).length > 0) {
                    var dataupload = "";
                    results.data.map((d, i) => {
                        let tokenValues = Object.values(d);
                        dataupload += (i + 1).toString() + " " + d.join(",") + "\n";
                        if (tokenValues[0].length == 0) {
                            setError("Token Address can not be empty");
                            return false;
                        } else if (!contractAddress_regex.test(tokenValues[0])) {
                            setError("Token Address can not be empty");
                            return false;
                        } else if (tokenValues[1].length == 0 || isNaN(tokenValues[1])) {
                            setError("Invalid amount.");
                            return false;
                        } else {
                            finalTokens.push({ "tokenName": tokenValues[0], "amount": tokenValues[1] });
                        }


                    });
                    setUploadedData(dataupload.substring(0, dataupload.length - 1));
                    if (finalTokens.length > 0 && error == "") {
                        setFileData(finalTokens);
                        if (tokenerror == "") {
                            setisBtnDisable(false)
                        }

                    }
                    else {
                        setFileData(null);
                        setisBtnDisable(true)
                    }
                }

                setLoading(false);
            },
        });
    };

    const getContractAddr = async (e) => {
        settxtLoading(true);
        var newToken = e.currentTarget.value;
        let contractAddress_regex = new RegExp('0x[a-fA-F0-9]{40}$');
        if (newToken == "") {
            settokenerror("Token Address Required");
            setisBtnDisable(true);
        } else if (!contractAddress_regex.test(newToken)) {
            settokenerror("Required Valid Token Address");
            setisBtnDisable(true);
        } else {
            if (isERC721Selected) {
                try {
                    let reqObj = {
                        method: "GET",
                        headers: { "authorization": `Bearer ${user.token}` },
                        url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/${isERC721Selected ? 'erc721' : 'erc1155'}`,

                    };

                    let resp = await globalService(reqObj);

                    if (resp != null) {

                        const tokenInst = new web3.eth.Contract(resp.contractABI, newToken);

                        let checkBalance = await tokenInst.methods.balanceOf(account).call();
                        if (checkBalance <= 0) {
                            settokenerror("You don't have any NFT");
                            setisBtnDisable(true);
                        } else {
                            settokenerror("");
                        }


                    }
                } catch (ex) {
                    console.log(ex);
                }
            }

        }
        setTokenAddress(newToken);
        settxtLoading(false);
    }

    const checkownership = async (tokenId, amount) => {
        try {
            let reqObj = {
                method: "GET",
                headers: { "authorization": `Bearer ${user.token}` },
                url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/${isERC721Selected ? 'erc721' : 'erc1155'}`,

            };

            let resp = await globalService(reqObj);
            console.log(resp);
            if (resp != null) {

                const tokenInst = new web3.eth.Contract(resp.contractABI, tokenAddress);
                console.log(tokenInst);
                console.log("isERC721Selected",isERC721Selected);
                if (isERC721Selected) {
                    const owner = await tokenInst.methods.ownerOf(tokenId).call();
                    if (owner == account) {
                        return "Available";
                    } else {
                        return "Unavailable";
                    }
                } else {
                    const balance = await tokenInst.methods.balanceOf(account, tokenId).call();
                    console.log("balance=",balance);
                    if (balance >= parseInt(amount)) {
                        return "Available";
                    } else {
                        return "Unavailable";
                    }
                }

            }
        } catch (ex) {
            console.log(ex);
        }

    }

    const submitToken = () => {
        setLoading(!isloading);
        setContractAddress(tokenAddress);
        sessionStorage['tokenStandard'] = isERC721Selected ? "erc721" : "erc1155";
        const finalTokens = [];
        let tokenArray = tokenList.split("\n");
        tokenArray.forEach(async (item, i) => {
            let eachToken = item.substring(item.indexOf(" ") + 1, item.length).split(",");
            if (isERC721Selected) {
                let isAvailable = await checkownership(eachToken[1], 0);
                finalTokens.push({ "address": eachToken[0], "tokenID": eachToken[1], "isAvailable": isAvailable });
            } else {
                let isAvailable = await checkownership(eachToken[1], eachToken[2]);
                finalTokens.push({ "address": eachToken[0], "tokenID": eachToken[1], "amount": eachToken[2], "isAvailable": isAvailable });
            }
            if (i == tokenArray.length - 1) {
                setLoading(!isloading);
                setFinalTokenList(finalTokens);
            }

        })

    }
    return (
        <>
            <div className='grid grid-row-2 md:grid-cols-2 bg-white rounded-lg mt-5 p-4'>

                <div className='row-span-1 md:col-span-1 p-6'>
                    <div className='flex flex-row items-center mb-3'>
                        <div className='w-6'>
                            <CreateTokenIcon />
                        </div>
                        <p className='text-base font-light pl-2'>Works with all your tokens, even if created without Token Tool</p>
                    </div>
                    <div className='flex flex-row items-center mb-3'>
                        <div className='w-6'>
                            <CreateTokenIcon />
                        </div>
                        <p className='text-base font-light pl-2'>Multisend NFTs to many recipients</p>
                    </div>
                    <div className='flex flex-row items-center mb-3'>
                        <div className='w-6'>
                            <CreateTokenIcon />
                        </div>
                        <p className='text-base font-light pl-2'>Send NFTs on both ERC721 and ERC1155 token standards</p>
                    </div>
                    <div className='flex flex-row items-center mb-3'>
                        <div className='w-6'>
                            <CreateTokenIcon />
                        </div>
                        <p className='text-base font-light pl-2'>Input list of addresses and amounts manually</p>
                    </div>
                    <div className='flex flex-row items-center mb-3'>
                        <div className='w-6'>
                            <CreateTokenIcon />
                        </div>
                        <p className='text-base font-light pl-2'>Distribute automatically via CSV upload</p>
                    </div>

                    <SwitchNetworkButtons></SwitchNetworkButtons>
                         
                   
                </div>

                <div className="row-span-1 md:col-span-1 w-full my-6 max-w-sm sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700 mx-auto">

                <p className='font-medium text-xl my-4'>Select NFT protocol standard</p>
                    <div>
                        <ul className="nav nav-pills nav-justified flex flex-row flex-wrap list-none pl-0 mb-4"
                            id="pills-tabJustify" role="tablist">
                            <li className="nav-item flex-grow text-center my-2 mr-2" role="presentation"
                                onClick={() => setIsERC721Selected(true)}>
                                <a href="#pills-homeJustify"
                                    className={`active nav-link w-90 block font-medium text-xs leading-tight uppercase rounded px-2 py-3 focus:outline-none focus:ring-0`}
                                    id="pills-home-tabJustify" data-bs-toggle="pill" data-bs-target="#pills-homeJustify" role="tab"
                                    aria-controls="pills-homeJustify" aria-selected="false">ERC721</a>
                            </li>

                            <li className="nav-item flex-grow text-center my-2 md:ml-2" role="presentation"
                                onClick={() => { setIsERC721Selected(false) }}>
                                <a href="#pills-contactJustify"
                                    className="nav-link w-90 block font-medium text-xs leading-tight uppercase rounded px-6 py-3 focus:outline-none focus:ring-0"
                                    id="pills-billing-tabJustify" data-bs-toggle="pill" data-bs-target="#pills-billingJustify" role="tab"
                                    aria-controls="pills-billing-tabJustify" aria-selected="false"
                                >ERC1155</a>
                            </li>
                        </ul>
                    </div>
                    <p className='font-medium text-xl my-4'>Select token</p>
                    <input
                        type="text"
                        name="tokanAddress"
                        id="tokanAddress"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder=""
                        onChange={(e) => {
                            getContractAddr(e)
                        }}
                    />
                    {tokenerror != "" && <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{tokenerror}</div>}
                    {istxtloading && <div className="cover-spin flex justify-center items-center">

                        <Loader type={'spinningBubbles'} color="#ed8936" />

                    </div>}
                  

                    <p className='font-medium text-xl my-4'>
                        {isERC721Selected ? 'Addresses with TokenID'
                            : 'Addresses with TokenID & amount'}
                    </p>
                    <div className='my-4'>

                        <div className='border-dashed border-black-800 border p-3'>
                            <div className='flex flex-col justify-center items-center '
                                onClick={() => { handleUpload() }}>
                                <FeatherIcon icon="upload-cloud" size="20px" />
                                <p className='text-xs'>
                                    Click to upload
                                </p>
                                <p className='text-xs'>
                                    {isERC721Selected ? '(the file should contain a list of addresses, TokenIDs)'
                                        :
                                        '(the file should contain a list of addresses, TokenIDs and amounts)'}
                                </p>
                            </div>
                            <input
                                onChange={uploadFile}
                                id="filePicker" className='opacity-0' type={"file"}
                                ref={fileUploader} />
                        </div>

                        <label for="tokanAddress" className="my-4 block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            <span className="text-red-300">*</span> Insert manually
                        </label>

                        {isERC721Selected ?
                            <NumberedTextArea setTokenList={setTokenList}
                                note='Insert one address and the respective TokenID per line. Separate the address and TokenID with a comma and no space in between.
                                Please NOTE: NFTs will be sent to batches of 200 addresses. If there are more than 200 addresses in your list, you will have to approve each batch separately.'
                                tokenStandard="ERC721" uploadedData={uploadedData} setError={setError} />
                            :
                            <NumberedTextArea setTokenList={setTokenList}
                                note='Insert one address, respective TokenID and the amount. Separate the address, TokenID and amount with a comma and no space in between.
                                Please NOTE: NFTs will be sent to batches of 200 addresses. If there are more than 200 addresses in your list, you will have to approve each batch separatel'
                                tokenStandard="ERC1155" uploadedData={uploadedData} setError={setError} />
                        }
                        {isBtnDisable && <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{error}</div>}
                        {isloading ? <div className="cover-spin flex justify-center items-center">

                            <Loader type={'spinningBubbles'} color="#ed8936" />

                        </div> :
                            <button type='submit' className={`w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded mt-9 ${isBtnDisable ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 "}`} onClick={submitToken} disabled={isBtnDisable}>
                                Continue
                            </button>
                        }
                    </div>
                </div>
               
            </div>
        </>
    )
}
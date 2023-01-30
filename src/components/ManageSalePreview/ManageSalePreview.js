import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import Loader from 'react-loading';
import FeatherIcon from "feather-icons-react";
import { useWeb3React } from '@web3-react/core';
import Papa from "papaparse";
import moment from 'moment-js';
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { Formik } from 'formik';
import SelectDateTime from "../SelectDateTime";
import {
    USER_BASE_URL,
    globalService,
    TOKEN_SALE_DETAILS_URL,
    GET_CONTRACT_VALUE,
    UPDATE_TOKEN_SALE_URL,
    UPDATE_WHITELIST_ADDRESS_URL,
    Networks
} from "../../helpers";

const Web3 = require('web3');


export default function ManageSalePreview(data) {
    const { library, account, chainId } = useWeb3React();
    const web3 = new Web3(library?.provider);
    const navigate = useNavigate();
    const btnRef = useRef();
    const fileUploader = useRef(null);

    const [endTime, setendTime] = useState('');
    const [endDays, setendays] = useState('');
    const [startDate, setStartDate] = useState();
    const [currentStartTime, setCurrentStartTime] = useState(new Date().getTime());

    const [isloadingFunds, setLoadingFunds] = useState(false);
    const [isloadingTokens, setLoadingTokens] = useState(false);
    const [isloadingMaxInvest, setLoadingMaxInvest] = useState(false);
    const [isloadingEndDate, setLoadingEndDate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [networkSymbol, setNetworkSymbol] = useState(Networks[chainId].nativeCurrency.symbol);
    const [networkUrl, setNetworkUrl] = useState("");
    const [isendTimeEdit, setIsendTimeEdit] = useState(false);
    const [isMinInvestEdit, setisMinInvestEdit] = useState(false);
    const [isMaxInvestEdit, setisMaxInvestEdit] = useState(false);
    const [fileData, setFileData] = useState([]);
    const [error, setError] = useState('');
    const [balance, setBalance] = useState('');
    const [supplytoken, setSupplytoken] = useState('');
    const [balanceFund, setBalanceFund] = useState('');
    const [isbtnDelete, setisbtnDelete] = useState(false);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [tokenSaleDetails, setTokenSaleDetails] = useState();
    const [tokensaleUrl, setTokenSaleUrl] = useState('');
    const [isAllowEdit, setisAllowEdit] = useState(false);

    useEffect(async () => {
        getTokenDetails();
    }, [data.tokenaddr])

    useEffect(() => {
        const interval = setInterval(() => {
            let timeDiff = (currentStartTime - 10 * 60000) - new Date().getTime();
            if (timeDiff <= 0) {
                setisAllowEdit(false);
                clearInterval(interval);
            } else {
                setisAllowEdit(true);
            }
            return () => clearInterval(interval);
        }, 1000);

    }, [])

    const getTokenDetails = async () => {
        let reqObj = {
            method: "GET",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${TOKEN_SALE_DETAILS_URL}/${(data.tokenaddr).toLowerCase()}`,

        };
        const resp = await globalService(reqObj);
        if (resp != null) {

            setTokenSaleDetails(resp);
            let baseUrl = window.location.origin;
            let saleUrl = baseUrl + "/tokenSale/" + resp.contractAddress + "/" + resp.chainId;
            let tempUrl = Networks[chainId].blockExplorerUrl + "tx/";
            let tokenUrl = tempUrl + resp.txHash;
            setNetworkUrl(tokenUrl);
            setTokenSaleUrl(saleUrl)
            const startDate = new Date(resp.startDate);
            const endDate = new Date(resp.endDate);
            const timeDiff = Math.abs(endDate - startDate);
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            setCurrentStartTime(startDate.getTime());
            setendays(daysDiff);
            setendTime(resp.endDate);
            sessionStorage.setItem("startTime", startDate);

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
                let balanceToken = await tokenInst.methods.tokenBalance().call();
                let balanceFunds = await tokenInst.methods.fundBalance().call();
                let supply = await tokenInst.methods.supply().call();
                setSupplytoken(supply);
                setBalance(balanceToken);
                setBalanceFund(balanceFunds);

            }
        } catch (ex) {
            console.log(ex);

        }
    }

    const handleUpload = () => {
        fileUploader.current.click();
    };
    const validation = async (values, type) => {
        console.log(values);
        const errors = {};
        if (type == "capvalues") {
            if (!values.hardCap) {
                errors.hardCap = 'Hard Cap Required';
            } else if (parseInt(values.hardCap) == NaN) {
                errors.hardCap = 'Hard Cap Must Be A Number';
            }
            else if (parseInt(values.hardCap) <= 0) {
                errors.hardCap = 'Hard Cap Must Be  Greater Than 0';
            }
            if (!values.softCap) {
                errors.softCap = 'Soft Cap Required';
            } else if (parseInt(values.softCap) == NaN) {
                errors.softCap = 'Soft Cap Must Be A Number';
            }
            else if (parseInt(values.softCap) <= 0) {
                errors.softCap = 'Soft Cap Must Be Greater Than 0';
            } else if (parseInt(values.hardCap) / 2 > parseInt(values.softCap)) {
                errors.softCap = 'Soft Cap Must Be At Least 50% Of Hard Cap';
            } else if (parseInt(values.hardCap) < parseInt(values.softCap)) {
                errors.softCap = 'Hard Cap Must Be Greater Than Soft Cap';
            }
        } else if (type == "investmentValues") {
            if (!values.minInvest) {
                errors.minInvest = 'Min Investment Amount Required';
            }
            if (!values.maxInvest) {
                errors.maxInvest = 'Max Investment Amount Required';
            }
            if (parseFloat(values.minInvest) > parseFloat(values.maxInvest)) {
                errors.minInvest = 'Min Investment Amount Should Be Less Than Max Investment Amount';
            }
        }

        console.log(errors);
        return errors;
    }
    const withdrawFunction = async (event) => {

        setLoading(true);
        let reqObj = {
            method: "GET",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,

        };
        const resp = await globalService(reqObj);

        if (resp != null) {
            const tokenInst = new web3.eth.Contract(resp.contractABI, data.tokenaddr);
            if (event == "withdrawToken") {
                tokenInst.methods.withdrawTokens('0x278d78093e877115ab9af4fa3af5c073e6f64377', 1).send({
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
            } else {
                tokenInst.methods.withdraw().send({
                    from: account, maxPriorityFeePerGas: null,
                    maxFeePerGas: null
                }, function (err, res) {
                    if (err) {
                        console.log(err);

                    } else {
                        console.log(res);

                    }

                    setLoading(false);
                }
                )

            }
        }

    };
    const saveUploadedData = async () => {
        const hashDetails = getMarkelTreeRootHash(fileData);
        console.log(hashDetails);
        let reqObj = {
            method: "GET",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,

        };
        const resp = await globalService(reqObj);

        if (resp != null) {
            const tokenInst = new web3.eth.Contract(resp.contractABI, data.tokenaddr);
            tokenInst.methods.setMerkleRoot(hashDetails.rootHash).send({
                from: account, maxPriorityFeePerGas: null,
                maxFeePerGas: null
            }, function async(err, res) {
                if (err) {
                    console.log(err);

                } else {
                    //async () => {
                    console.log("test")
                    try {
                        let tempdata = {
                            addressList: fileData,
                            contractAddress: tokenSaleDetails.contractAddress
                        }
                        var config = {
                            method: "POST",
                            headers: { "authorization": `Bearer ${user.token}` },
                            url: `${USER_BASE_URL}/${UPDATE_WHITELIST_ADDRESS_URL}`,
                            data: { ...tempdata },
                        };

                        //const respObj =   globalService(config);
                        globalService(config).then((respObj) => {
                            console.log(respObj);
                            if (respObj.status == 0) {
                                sessionStorage.clear();
                                navigate("/");
                            } else {


                                if (respObj.status == '2') {
                                    toast.error(respObj.msg);
                                } else {
                                    toast.success(respObj.msg);
                                }

                            }
                        })

                    } catch (err) {
                        console.log(err);
                        // setLoading(false);
                        toast.error("Token Creation Fail!")
                    }
                }



            }


                //          }
            )
        }


    }
    const setUpdate = async (type) => {
        if (type == 'endTime') {
            setIsendTimeEdit(!isendTimeEdit);
        } else if (type == 'minInvest') {
            setisMinInvestEdit(!isMinInvestEdit);
        } else if (type == 'maxInvest') {
            setisMaxInvestEdit(!isMaxInvestEdit);
        }
    }
    const onChangeInfo = async (e) => {

        const key = e.target.name;
        if (key != "startTime") {
            const value = e.target.value;
            console.log(key, "===", e.target.value);
            if (key == "hardCap" && value != "") {

                setTokenOnSale(parseFloat(tokenSaleDetails.saleRate) * parseFloat(value))

            } else if (key == "saleDuration") {
                setendays(parseInt(value == "" ? 0 : value))
            }
        }


    }
    useEffect(() => {
        console.log(startDate, endDays);
        if (tokenSaleDetails) {
            let temp = new Date(startDate);
            if (endDays != "" && startDate != undefined) {
                let calcutaledEndDate = new Date(startDate);
                calcutaledEndDate.setDate(temp.getDate() + parseInt(endDays));
                setendTime(moment(calcutaledEndDate).format("MM/DD/YYYY HH:mm:ss").toString());
            }
            // else {
            //     setendTime(moment(temp).format("MM/DD/YYYY HH:mm:ss").toString());
            // }
        }

    }, [startDate, endDays])

    const handleSubmit = async (values, type) => {
        console.log(values);
        var tempdata = {};
        let isUpdated = false;
        let reqObj = {
            method: "GET",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,

        };
        const resp = await globalService(reqObj);
        if (type == "capvalues") {
           // setLoadingHardCap(true);
            tempdata = {
                details: {
                    "hardCap": values.hardCap,
                    "softCap": values.softCap
                },
                id: tokenSaleDetails._id
            }
            if (resp != null) {
                try {
                    const tokenInst = new web3.eth.Contract(resp.contractABI, data.tokenaddr);
                    await tokenInst.methods.setCapping(parseInt(values.softCap), parseInt(values.hardCap)).send({
                        from: account
                    }, function (err, res) {
                        if (err) {
                            console.log(err);
                            toast.error("Data Update Fail!")

                        } else {
                            console.log(res);
                            isUpdated = true;

                        }
                    }
                    )
                } catch (ex) {
                    toast.error("Data Update Fail!")
                  //  setLoadingHardCap(false);
                    return false;
                }
            } else {
                toast.error("Data Update Fail!");
               // setLoadingHardCap(false);
                return false;
            }
        } else if (type == "investmentValues") {
            setLoadingMinInvest(true);
            tempdata = {
                details: {
                    "minInvest": values.minInvest,
                    "maxInvest": values.maxInvest
                },
                id: tokenSaleDetails._id
            }
            if (resp != null) {
                try {
                    const tokenInst = new web3.eth.Contract(resp.contractABI, data.tokenaddr);
                    await tokenInst.methods.setInvestment(parseInt(values.minInvest), parseInt(values.maxInvest)).send({
                        from: account
                    }, function (err, res) {
                        if (err) {
                            console.log(err);
                            toast.error("Data Update Fail!")

                        } else {
                            console.log(res);
                            isUpdated = true;

                        }
                    }
                    )
                } catch (ex) {
                    toast.error("Data Update Fail!")
                   // setLoadingHardCap(false);
                    return false;
                }
            } else {
                toast.error("Data Update Fail!");
               // setLoadingHardCap(false);
                return false;
            }
        } else if (type == "saleTime") {
            setLoadingEndDate(true);
            tempdata = {
                details: { "startDate": startDate, "endDate": endTime },
                id: tokenSaleDetails._id
            }
            if (resp != null) {
                try {
                    let tempStartTime = new Date(startDate);
                    let startTimestamp = tempStartTime.getTime();
                    let tempEndTime = new Date(endTime);
                    let endTimestamp = tempEndTime.getTime();
                    const tokenInst = new web3.eth.Contract(resp.contractABI, data.tokenaddr);
                    await tokenInst.methods.setTime(startTimestamp, endTimestamp).send({
                        from: account
                    }, function (err, res) {
                        if (err) {
                            toast.error("Data Update Fail!")

                        } else {
                            isUpdated = true;

                        }
                    }
                    )
                } catch (ex) {
                    toast.error("Data Update Fail!")
                  //  setLoadingHardCap(false);
                    return false;
                }
            } else {
                toast.error("Data Update Fail!");
              //  setLoadingHardCap(false);
                return false;
            }
        }
        var config = {
            method: "POST",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${UPDATE_TOKEN_SALE_URL}`,
            data: { ...tempdata },
        };
        if (isUpdated == true) {
            try {

                const resp = await globalService(config);
                if (resp.status == 0) {
                    sessionStorage.clear();
                    navigate("/");
                } else {


                    if (resp.status == '2') {
                        toast.error(resp.msg);
                    } else {
                        toast.success(resp.msg);
                    }
                    if (type == "capvalues") {
                      //  setLoadingHardCap(false);
                       // setIsHardCapEdit(false);
                    } else if (type == "investmentValues") {
                        setLoadingMaxInvest(false);
                        setisMaxInvestEdit(false);
                    } else if (type == "saleTime") {
                        setLoadingEndDate(false);
                        setIsendTimeEdit(false);
                    }
                    getTokenDetails();
                }

            } catch (err) {
                console.log(err);
                // setLoading(false);
                toast.error("Token Creation Fail!")
            }
        }

    }
    useEffect(() => {
        if (fileData.length > 1) {
            setisbtnDelete(true);
        } else {
            setisbtnDelete(false);
        }
    }, [fileData])
    const uploadFile = async (event) => {
        event.preventDefault();
        setLoading(true);
        Papa.parse(event.target.files[0], {
            header: false,
            skipEmptyLines: true,
            complete: function (results) {
                const finalTokens = [];
                setError("");
                // setFileUpload(true);
                let contractAddress_regex = new RegExp('0x[a-fA-F0-9]{40}$');
                // Iterating data to get column name and their values
                if (Object.keys(results.data).length > 0) {
                    results.data.map((d, i) => {
                        let tokenValues = Object.values(d);
                        if (!contractAddress_regex.test(tokenValues[0])) {
                            setError("Invalid Address");
                            return false;
                        } else {
                            finalTokens.push(tokenValues[0]);
                        }


                    });

                    if (finalTokens.length > 0 && error == "") {
                        setFileData(finalTokens);
                        console.log(fileData);
                        // if (error == "") {
                        //     setisBtnDisable(false)
                        // }

                    }
                    else {
                        setFileData(null);
                        // setisBtnDisable(true)
                    }
                }

                setLoading(false);
            },
        });
    };
    const LabelValueComponent = ({ label, value, showEdit, url }) => {

        return (

            <div className='grid grid-cols-3'>

                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{`${label}  :`}</span>

                {showEdit ?

                    <div className='flex flex-row items-center'>


                        <a href={url} className='text-blue-500' target='_blank'>
                            <span className="text-sm font-medium text-blue-500 dark:text-blue-500" >
                                {value.slice(0, 48) + "..."}
                            </span>
                        </a>
                    </div>

                    : <span className="text-sm font-medium text-gray-500 dark:text-gray-300" >{value}</span>}

            </div>

        )

    }
    const RemoveToken = (address) => {
        let tempAddressList = fileData;
        // let index = tempAddressList.filter((item) => { return item!= address });
        // if (index > -1) {
        //     tempAddressList.splice(index, 1);
        setFileData(tempAddressList.filter((item) => { return item != address }));
        // if (tempAddressList.length > 1) {
        //     setbtnDelete(true)
        // } else {
        //     setbtnDelete(false)
        // }

        // }
    }
    const getMarkelTreeRootHash = function async(whitelistAddresses) {
        // 3. Create a new array of `leafNodes` by hashing all indexes of the `whitelistAddresses`
        // using `keccak256`. Then creates a Merkle Tree object using keccak256 as the algorithm.
        //
        // The leaves, merkleTree, and rootHas are all PRE-DETERMINED prior to whitelist claim
        const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

        // 4. Get root hash of the `merkleeTree` in hexadecimal format (0x)
        // Print out the Entire Merkle Tree.
        const rootHash = merkleTree.getRoot();
        // ***** ***** ***** ***** ***** ***** ***** ***** // 

        // CLIENT-SIDE: Use `msg.sender` address to query and API that returns the merkle proof
        // required to derive the root hash of the Merkle Tree


        const claimingAddress = leafNodes[whitelistAddresses.length - 1]
        // `getHexProof` returns the neighbour leaf and all parent nodes hashes that will
        // be required to derive the Merkle Trees root hash.
        const hexProof = merkleTree.getHexProof(claimingAddress);
        // This would be implemented in your Solidity Smart Contract
        return ({ "rootHash": rootHash, "hexProof": hexProof });
    }
    return (
        <>
            {tokenSaleDetails &&

                <div className='w-full ml-20 flex flex-col md:flex-row'>
                    <div className="w-3/4 md:full mt-5 p-4 bg-white rounded-lg border border-gray-200 shadow-md sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700 ">
                        <h5 className="text-center text-xl font-medium text-gray-900 dark:text-white">Token sale information</h5>
                        <div className="form-check flex items-baseline mt-4">
                            <div>
                                <LabelValueComponent label='Token' showEdit={false} value={tokenSaleDetails.tokenSymbol} />
                                <LabelValueComponent label='Token Address' showEdit={true} value={tokenSaleDetails.tokenAddress} url={networkUrl} />
                                <LabelValueComponent label='Token Sale URL' showEdit={true} value={tokensaleUrl} url={tokensaleUrl} />
                                <LabelValueComponent label='Total token supply' showEdit={false} value={supplytoken} />
                                <LabelValueComponent label='Number of tokens on sale' showEdit={false} value={tokenSaleDetails.tokenSymbol + " " + tokenSaleDetails.tokenOnSale} />

                                <LabelValueComponent label='Price per token' showEdit={false} value={"1 " + networkSymbol + " = " + tokenSaleDetails.saleRate + " " + tokenSaleDetails.tokenSymbol} />
                                {tokenSaleDetails.selectedPayment == "custom" &&
                                    <LabelValueComponent label='Payment token' showEdit={false} value={tokenSaleDetails.contractAddress} />
                                }
                                {tokenSaleDetails.selectedPayment == "custom" &&
                                    <LabelValueComponent label='Payment Token Address' showEdit={false} value={tokenSaleDetails.contractAddress} />
                                }

                                <LabelValueComponent type="softCap" showEdit={false} label={'Soft cap in ' + tokenSaleDetails.tokenSymbol} value={tokenSaleDetails.softCap} />


                                <LabelValueComponent type="hardCap" showEdit={false} label={'Hard cap in ' + tokenSaleDetails.tokenSymbol} value={tokenSaleDetails.hardCap} />

                                <LabelValueComponent showEdit={false} label='Token sale owner address' value={tokenSaleDetails.ownerAddress} />
                                <hr />
                                <h5 className="py-4 text-center text-xl font-medium text-gray-900 dark:text-white">General settings</h5>
                               {!isAllowEdit && <div className='flex flex-row  bg-red-100 py-3 px-2' >
                                    <FeatherIcon icon="alert-circle" size="15px" className="text-red-600"></FeatherIcon>
                                    <p className="ml-2 text-xs text-red-600">
                                        The parameters can only be edited until 10 minutes before the token sale start.
                                    </p>
                                </div>}
                                <LabelValueComponent type="minInvest" showEdit={false} label={"Min investment amount in " + tokenSaleDetails.tokenSymbol} value={tokenSaleDetails.minInvest} />

                                <LabelValueComponent type="maxInvest" showEdit={false} label={"Max investment amount in " + tokenSaleDetails.tokenSymbol} value={tokenSaleDetails.maxInvest} />

                                {!isMaxInvestEdit ?
                                    isAllowEdit && <a href='#' className='p-3 text-blue-500  text-sm font-medium underline' onClick={() => { setUpdate("maxInvest") }}>
                                        Edit Investment Values
                                    </a>
                                    :
                                    <Formik
                                        initialValues={{ maxInvest: tokenSaleDetails.maxInvest, minInvest: tokenSaleDetails.minInvest }}
                                        validate={(values) => validation(values, "investmentValues")}
                                        onSubmit={(values, { setSubmitting, setFieldValue }) => handleSubmit(values, "investmentValues")} >
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
                                                <form onSubmit={handleSubmit} onChange={(e) => onChangeInfo(e)}>
                                                    <div className='border border-gray-300 p-4'>
                                                        <div className="mb-2">
                                                            <label for="minInvest" className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                                Min investment amount in {networkSymbol}<span className="text-red-600">*</span></label>
                                                            <input
                                                                type="number"
                                                                name="minInvest"
                                                                id="minInvest"
                                                                onBlur={handleBlur}
                                                                value={values.minInvest}
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white mr-3"
                                                                placeholder="Enter Soft cap "
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                required
                                                            />
                                                            {errors.minInvest && touched.minInvest && (
                                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.minInvest}</div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label for="maxInvest" className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                                Max investment amount in {networkSymbol}<span className="text-red-600">*</span></label>
                                                            <input
                                                                type="number"

                                                                name="maxInvest"
                                                                id="maxInvest"
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white mr-3"
                                                                placeholder="Enter Hard cap"
                                                                onBlur={handleBlur}
                                                                value={values.maxInvest}
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                required
                                                            />

                                                            {errors.maxInvest && touched.maxInvest && (
                                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.maxInvest}</div>
                                                            )}
                                                        </div>
                                                        <div className='flex flex-row'>
                                                            {isloadingMaxInvest ? <div className="cover-spin flex justify-center items-center">

                                                                <Loader type={'spinningBubbles'} color="#ed8936">

                                                                </Loader>

                                                            </div>
                                                                :

                                                                <button disabled={!(dirty && isValid)} className={`w-40 py-2 px-2 mr-4  mt-9 rounded text-white h-10 ${!(dirty && isValid) ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500"}`}>
                                                                    Save
                                                                </button>
                                                            }

                                                            <button onClick={() => { setUpdate('maxInvest') }}
                                                                type='submit'
                                                                className={`w-40 text-white font-bold py-2 px-2 rounded mt-9 bg-gray-300`}
                                                            >
                                                                Cancel

                                                            </button>
                                                        </div>


                                                    </div>
                                                </form>
                                            )
                                        }
                                    </Formik>
                                }
                                <LabelValueComponent showEdit={false} label='Token sale start time' value={tokenSaleDetails.startDate} />
                                <LabelValueComponent type="endTime" showEdit={false} label='Token sale end time' value={tokenSaleDetails.endDate} />

                                {!isendTimeEdit ?
                                    isAllowEdit && <a href='#' className='p-3 text-blue-500  text-sm font-medium underline' onClick={() => { setUpdate("endTime") }}>
                                        Edit Sale Time
                                    </a>
                                    :
                                    <Formik
                                        initialValues={{ startDate: tokenSaleDetails.startDate, saleDuration: endDays }}
                                        validate={(values) => validation(values, "saleDuration")}
                                        onSubmit={(values, { setSubmitting, setFieldValue }) => handleSubmit(values, "saleTime")} >
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
                                                <form onSubmit={handleSubmit} onChange={(e) => onChangeInfo(e)}>
                                                    <div className='border border-gray-300 p-4'>
                                                        <div className="mb-2">
                                                            <label for="startTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                                Token sale start time<span className="text-red-600">*</span></label>

                                                            <SelectDateTime id="startDate" name="startDate" setDateTime={setStartDate} onTimeChange={(values) => validation(values, "saleDuration")} startDate={startDate} />
                                                            {errors.startDate && touched.startDate && (
                                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.startDate}</div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label for="saleDuration" className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                                Token sale duration in days<span className="text-red-600">*</span></label>
                                                            <input
                                                                type="number"

                                                                name="saleDuration"
                                                                id="saleDuration"
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white mr-3"
                                                                placeholder="Enter Sale Duration"
                                                                onBlur={handleBlur}
                                                                value={values.saleDuration}
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                required
                                                            />

                                                            {errors.saleDuration && touched.saleDuration && (
                                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.saleDuration}</div>
                                                            )}
                                                        </div>
                                                        <div className='py-2 flex flex-row'>
                                                            <FeatherIcon icon="clock" size="15px" className="text-gray-500" ></FeatherIcon>
                                                            <p className=" block ml-3 text-sm font-medium text-gray-500 dark:text-gray-300">
                                                                Token sale end time: {endTime}
                                                            </p>
                                                        </div>
                                                        <div className='flex flex-row'>
                                                            {isloadingEndDate ? <div className="cover-spin flex justify-center items-center">

                                                                <Loader type={'spinningBubbles'} color="#ed8936">

                                                                </Loader>

                                                            </div>
                                                                :

                                                                <button disabled={!(dirty && isValid)} className={`w-40 py-2 px-2 mr-4  mt-9 rounded text-white h-10 ${!(dirty && isValid) ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500"}`}>
                                                                    Save
                                                                </button>
                                                            }

                                                            <button onClick={() => { setUpdate('endTime') }}
                                                                type='submit'
                                                                className={`w-40 text-white font-bold py-2 px-2 rounded mt-9 bg-gray-300`}
                                                            >
                                                                Cancel

                                                            </button>
                                                        </div>


                                                    </div>
                                                </form>
                                            )
                                        }
                                    </Formik>
                                }
                                <LabelValueComponent showEdit={false} label='Token sale lock time' value={tokenSaleDetails.claimDate} />
                                <LabelValueComponent showEdit={false} label='Investor whitelist' value={tokenSaleDetails.addressType} />
                                {tokenSaleDetails.addressType == 'Only whitelisted addresses can invest' &&
                                    <div>
                                        <div className='w-3/5 border-dashed border-black-800 border p-3 m-3'>
                                            <div className='flex flex-col justify-center items-center '
                                                onClick={() => { handleUpload() }}>
                                                <FeatherIcon icon="upload-cloud" size="20px" />
                                                <p className='text-xs'>
                                                    Click to upload
                                                </p>

                                            </div>
                                            <input
                                                onChange={uploadFile}
                                                id="filePicker" className='opacity-0' type={"file"}
                                                ref={fileUploader} />
                                        </div>
                                        {
                                            fileData.length > 0 &&
                                            <div>
                                                <div className='overflow-x-auto overflow-y-scroll max-h-36 relative shadow-md sm:rounded-lg mt-4 '>
                                                    <table className='w-full'>
                                                        <tr id="" className=' py-8 w-full mr-4 bg-orange-500'>
                                                            <th className='w-20  py-4 text-center  text-white' >Address</th>

                                                            <th className='w-20  py-4 text-center text-white'>Remove</th>

                                                        </tr>
                                                        {fileData.map((val) => {
                                                            return (
                                                                <tr>
                                                                    <td className='w-20 py-3 text-center bg-gray-200'>{val}</td>


                                                                    <td className='w-20 py-3  text-center bg-gray-200'>

                                                                        {isbtnDelete && <a href='#' className='text-blue-500' onClick={() => { RemoveToken(val) }}><FeatherIcon icon="trash-2" color="blue" size="20px" className="ml-6" ></FeatherIcon> </a>}

                                                                    </td>

                                                                </tr>
                                                            )
                                                        })}
                                                    </table>


                                                </div>
                                                {isloadingTokens ? <div className="cover-spin flex justify-center items-center">

                                                    <Loader type={'spinningBubbles'} color="#ed8936">

                                                    </Loader>

                                                </div>
                                                    :
                                                    <button onClick={(e) => saveUploadedData()}
                                                        type='submit'
                                                        className={`w-60 bg-orange-500 hover:bg-orange-800 text-white font-bold py-2 px-2 rounded mt-3 mb-4 bg-orange-500}`}
                                                    >
                                                        Update

                                                    </button>
                                                }
                                            </div>

                                        }
                                    </div>
                                }

                            </div>

                        </div>



                        <hr />
                        <h5 className="text-center text-xl py-4 font-medium text-gray-900 dark:text-white">Withdrawals</h5>
                        <div className='flex flex-row  bg-gray-300 py-3 px-2' >
                            <FeatherIcon icon="alert-circle" size="15px" className="text-gray-900"></FeatherIcon>
                            <p className="ml-2 text-xs text-gray-900">
                                Withdrawals automatically go to the connected wallet address.
                            </p>
                        </div>
                        <div className='py-2 flex flex-row'>
                            <FeatherIcon icon="activity" size="20px" className="text-gray-500" ></FeatherIcon>
                            <p className=" block ml-3 text-sm font-medium text-gray-500 dark:text-gray-300">
                                Token balance: {balance}
                            </p>
                        </div>
                        {isloadingTokens ? <div className="cover-spin flex justify-center items-center">

                            <Loader type={'spinningBubbles'} color="#ed8936">

                            </Loader>

                        </div>
                            :
                            <button onClick={(e) => withdrawFunction("withdrawToken")}
                                type='submit'
                                className={`w-60 bg-orange-500 hover:bg-orange-800 text-white font-bold py-2 px-2 rounded mt-9 bg-orange-500}`}
                            >
                                Withdraw All Tokens

                            </button>
                        }
                        <div className='py-2 flex flex-row'>
                            <FeatherIcon icon="activity" size="20px" className="text-gray-500" ></FeatherIcon>
                            <p className=" block ml-3 text-sm font-medium text-gray-500 dark:text-gray-300">
                                Funds balance: {balanceFund}
                            </p>
                        </div>
                        {isloadingFunds ? <div className="cover-spin flex justify-center items-center">

                            <Loader type={'spinningBubbles'} color="#ed8936">

                            </Loader>

                        </div>
                            :
                            <button onClick={(e) => withdrawFunction("withdrawFund")}
                                type='submit'
                                className={`w-60 bg-orange-500 hover:bg-orange-800 text-white font-bold py-2 px-2 rounded mt-9 bg-orange-500}`}
                            >
                                Withdraw All Funds

                            </button>
                        }

                    </div>
                </div>

            }

        </>
    )
}
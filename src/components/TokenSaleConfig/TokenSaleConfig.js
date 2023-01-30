import React, { useEffect, useState } from 'react';
import { Dialog, Combobox } from "@headlessui/react";
import Loader from 'react-loading';
import { Formik } from 'formik';
import FeatherIcon from "feather-icons-react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SelectDateTime from "../SelectDateTime";
import { useWeb3React } from '@web3-react/core';
import CommandPalette from "../CommandPalette";
import moment from 'moment-js';
import "./TokenSaleConfig.scss";
import {
    USER_BASE_URL,
    globalService,
    GET_CONTRACT_VALUE,
    Networks,
    web3ApiKey
} from "../../helpers";

const Web3 = require('web3');
var tokenDetails = {};

export default function TokenSaleConfig(tokenStandard, { settokenSaleDetails }) {

    const navigate = useNavigate();
    const { library, account, chainId } = useWeb3React();
    const [addressType, setaddressType] = useState("Every address can invest");
    const [tokenList, setTokenList] = useState([]);
    const [isloading, setLoading] = useState(false);
    const [tokenAddress, setTokenAddress] = useState("");
    const [hardCap, setHardCap] = useState(0);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState("");
    const [claimDate, setClaimDate] = useState("");
    const [saleDuration, setsaleDuration] = useState(0);
    const [saleRate, setsaleRate] = useState(0.0);
    const [claimDuration, setclaimDuration] = useState(0);
    const [tokenOnSale, setTokenOnSale] = useState(0);
    const [networkSymbol, setNetworkSymbol] = useState(Networks[chainId].nativeCurrency.symbol);
    const [selectedPayment, setselectedPayment] = useState(networkSymbol);
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [supply, setSupply] = useState("");
    const [tokenDtls, setTokenDtls] = useState();
    const [customContract, setCustomContract] = useState({ symbol: "", token_address: "" });
    const [initialValues, setInitialValues] = useState({
        contractAddress: '', tokenPrice: '', hardCap: '',
        softCap: '', minInvest: '', maxInvest: '', saleDuration: '', startDate: '',
        lockDuration: '', ownerAddress: account, selectedPayment: networkSymbol, addressType: 'Every address can invest'
    })
    //const [networkSymbol, setNetworkSymbol] = useState("-");
    const web3 = new Web3(library?.provider);
    const user = JSON.parse(sessionStorage.getItem("user"));
    console.log(tokenStandard);
    const onInputChange = async (e) => {

        const key = e.target.name;
        console.log(e.target.value);

        if (key != "startTime") {
            var inputdata = e.target.value;

            switch (true) {
                case (key == "saleDuration"):
                    setsaleDuration(parseInt(inputdata == "" ? 0 : inputdata));
                    break;
                case (key == "lockDuration"):
                    setclaimDuration(parseInt(inputdata == "" ? 0 : inputdata));
                    break;
                case (key == "tokenPrice"):
                    if (inputdata == "" || inputdata == 0) {
                        setsaleRate(0);
                    } else {
                        const selvalue = 1 / parseFloat(inputdata);
                        setsaleRate(selvalue);
                    }
                    break;
                case (key == "hardCap"):
                    setHardCap(inputdata == "" ? 0 : inputdata)
                    break;
                case (key == "selectedPayment"):
                    setselectedPayment(e.target.value);
                    break;
                case (key == "addressType"):
                    setaddressType(e.target.value);
                    break;
                case (key == "contractAddress"):
                    //  getcontractDetails(e.target.value);
                    break;
            }
        }
    }

    useEffect(() => {
        if (startDate != undefined) {

            let temp = new Date(startDate);
            const days = saleDuration + claimDuration;
            let calcutaledEndDate = new Date();
            let calcutaledClaimDate = new Date()
            calcutaledEndDate.setDate(temp.getDate() + parseInt(saleDuration));
            setEndDate(moment(calcutaledEndDate).format("MM/DD/YYYY HH:mm:ss").toString());
            calcutaledClaimDate.setDate(temp.getDate() + parseInt(days));
            setClaimDate(moment(calcutaledClaimDate).format("MM/DD/YYYY HH:mm:ss").toString());

        }

    }, [startDate, saleDuration, claimDuration])

    useEffect(() => {
        setTokenOnSale(parseFloat(saleRate) * parseFloat(hardCap))
    }, [saleRate, hardCap])

    useEffect(async () => {
        let dtl = await getcontractDetails(tokenStandard.tokenaddr["token_address"]);
        console.log(dtl);
           setSupply(dtl)
    }, [tokenStandard.tokenaddr["token_address"]])
    
    useEffect(async () => {
        console.log(selectedPayment);
        if (selectedPayment == "custom") {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'X-API-Key': web3ApiKey
                }
            };

            let hexchainid = web3.utils.toHex(chainId);
            fetch(`https://deep-index.moralis.io/api/v2/${account}/erc20?chain=${hexchainid}`, options)
                .then(response => response.json())
                .then(response => {
                    setTokenList(response)

                })
                .catch(err => console.log(err));
        }
    }, [selectedPayment])
    useEffect(() => {
        console.log(tokenAddress);
        if (tokenAddress) {

            let temp = tokenList.filter(item => item.token_address == tokenAddress)[0]
            setCustomContract(temp);
            console.log(temp);
        }

    }, [tokenAddress])
    const validate = (values) => {
        console.log(values);
        const errors = {};
        if (!values.tokenPrice) {
            errors.tokenPrice = 'Price Per Token Required';
        }
        if (!values.hardCap) {
            errors.hardCap = 'Hard Cap Required';
        } else if (parseInt(values.hardCap)==NaN) {
            errors.hardCap = 'Hard Cap Must Be A Number';
        }
        else if (parseInt(values.hardCap)<=0) {
            errors.hardCap = 'Hard Cap Must Be  Greater Than 0';
        }
        if (!values.softCap) {
            errors.softCap = 'Soft Cap Required';
        } else if (parseInt(values.softCap)==NaN) {
            errors.softCap = 'Soft Cap Must Be A Number';
        }
        else if (parseInt(values.softCap)<=0) {
            errors.softCap = 'Soft Cap Must Be Greater Than 0';
        }else if (parseInt(values.hardCap) / 2 > parseInt(values.softCap)) {
            errors.softCap = 'Soft Cap Must Be At Least 50% Of Hard Cap';
        }
        if (!values.minInvest) {
            errors.minInvest = 'Min Investment Amount Required';
        }else if (parseInt(values.minInvest)==NaN) {
            errors.minInvest = 'Min Investment Amount Must Be A Number';
        }
        else if (parseInt(values.minInvest)<=0) {
            errors.minInvest = 'Min Investment Amount Must Be Greater Than 0';
        }
        if (!values.maxInvest) {
            errors.maxInvest = 'Max Investment Amount Required';
        }else if (parseInt(values.maxInvest)==NaN) {
            errors.maxInvest = 'Max Investment Amount Must Be A Number';
        }
        else if (parseInt(values.maxInvest)<=0) {
            errors.maxInvest = 'Max Investment Amount Must Be Greater Than 0';
        }
        if (parseFloat(values.minInvest) > parseFloat(values.maxInvest)) {
            errors.minInvest = 'Min Investment Amount Should Be Less Than Max Investment Amount';
        }
        if (!values.saleDuration) {
            errors.saleDuration = 'Token Sale Duration Required';
        }
        if (!values.lockDuration) {
            errors.lockDuration = 'Token Lock Duration Required';
        }
        let starteD = new Date(startDate);
        if (new Date(startDate) == undefined || new Date(startDate) == "Invalid Date") {
            errors.startDate = "Token Sale Start Time Required";
        }
        return errors;
    }
    const getcontractDetails = async (address) => {
        console.log("getcontractDetails", address);
        const user = JSON.parse(sessionStorage.getItem("user"));
        try {
            let reqObj = {
                method: "GET",
                headers: { "authorization": `Bearer ${user.token}` },
                url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/createSale`,

            };

            var resp = await globalService(reqObj);
            if (resp != null) {

                const tokenInst = new web3.eth.Contract(resp.contractABI, address);
                 const supply = await tokenInst.methods.totalSupply().call();
                 console.log(supply);
                return ( supply);



            }
        } catch (ex) {
            console.log(ex);
            return ("");


        }
    }

    const handleSubmit = async (values, setSubmitting) => {
        console.log(tokenDtls);
        let data = {};
        values.startDate = moment(new Date(startDate)).format("MM/DD/YYYY HH:mm:ss").toString();
        data.endDate = endDate;
        data.claimDate = claimDate;
        data.saleRate = saleRate;
        data.tokenOnSale = tokenOnSale;
        data.tokenAddress = tokenStandard.tokenaddr["token_address"];
        data.symbol = tokenStandard.tokenaddr["symbol"];
        data.supply = supply;
        data.networkSymbol = networkSymbol;
        data.name = tokenStandard.tokenaddr["name"];
        data.decimals = tokenStandard.tokenaddr["decimals"];
        selectedPayment!="custom" ?data.paymentAddress="0x0000000000000000000000000000000000000000":data.paymentAddress=tokenAddress;
        data.paymentSymbol=customContract.symbol;
        tokenStandard.settokenSaleDetails({ ...values, ...data });
    }

    return (
        <>

            <Formik
                initialValues={initialValues}
                validate={(values) => validate(values)}
                onSubmit={(values, { setSubmitting, setFieldValue }) => handleSubmit(values, setSubmitting)} >
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
                        <form onSubmit={handleSubmit} onChange={(e) => onInputChange(e)} className='flex flex-col'>
                            <div className="flex md:flex-row flex-col">
                                <div className="w-50 md:w-full mt-5 bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700">

                                    <h6 className="text-center text-l font-medium text-gray-400 dark:text-white">Step 1 of 2: Configure your token sale</h6>
                                    <br />
                                    <div>
                                        <label for="name" className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-300">
                                            Select payment token</label>
                                        <div className='flex flex-row mb-2 gap-3'>
                                            <input type="radio" value={networkSymbol} id="selectedPayment" name="selectedPayment" checked={selectedPayment == networkSymbol} onChange={handleChange} /><p className="mx-2  text-sm font-medium text-gray-900 dark:text-gray-300">{networkSymbol}</p>

                                            <div class="tooltipsmp mx-2">
                                                <FeatherIcon icon="alert-circle" size="18px" className="text-gray-500"></FeatherIcon>
                                                <span className="tooltiptxt min-w-max bg-gray-500 border border-gray-300  text-sm">Your investors will have to send MATIC<br /> for this token sale.</span>
                                            </div>

                                        </div>
                                        <div className='flex flex-row'>
                                            <input type="radio" value="custom" id="selectedPayment" name="selectedPayment" checked={selectedPayment == "custom"} onChange={handleChange} /><p className="mx-2  text-sm font-medium text-gray-900 dark:text-gray-300" >Custom Token</p>
                                            <div class="tooltipsmp mx-2">
                                                <FeatherIcon icon="alert-circle" size="18px" className="text-gray-500"></FeatherIcon>
                                                <span className="tooltiptxt min-w-max bg-gray-500 border border-gray-300  text-sm">
                                                    Choose a custom token such as USDC<br /> as the payment method.
                                                </span>
                                            </div>
                                        </div>
                                        {selectedPayment == "custom" &&
                                            <div className='py-4'>
                                                <CommandPalette inputLabel={"contract address"} tokenList={tokenList} setTokenAddress={setTokenAddress}></CommandPalette>
                                                {errors.contractAddress && touched.contractAddress && (
                                                    <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.contractAddress}</div>
                                                )}

                                                <div className=''>
                                                    <div className='flex flex-row'><span className='text-sm font-medium text-gray-500'>Payment Token </span><span className='text-sm font-medium text-gray-500'>{customContract.symbol} </span></div>
                                                    <div className='flex flex-row'><span className='text-sm font-medium text-gray-500'> Payment Address </span><span className='text-sm font-medium text-gray-500'>{customContract.token_address} </span></div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div>
                                        <div className='py-4 mt-2'>
                                            <label className="block text-base font-medium text-gray-900 dark:text-gray-300">
                                                Set the token price
                                            </label>
                                        </div>
                                        <div >

                                            <label for="tokenPrice" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Price per token in {networkSymbol}<span className="text-red-600">*</span></label>
                                            <input
                                                type="number"
                                                name="tokenPrice"
                                                id="tokenPrice"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="eg.  0.1"
                                                onBlur={handleBlur}
                                                value={values.tokenPrice}
                                                onChange={
                                                    handleChange
                                                }


                                                required
                                            />

                                            {errors.tokenPrice && touched.tokenPrice && (
                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.tokenPrice}</div>
                                            )}

                                        </div>
                                        <div className='py-2 flex flex-row'>
                                            <FeatherIcon icon="activity" size="20px" className="text-gray-500" ></FeatherIcon>
                                            <p className=" block ml-3 text-sm font-medium text-gray-500 dark:text-gray-300">
                                                Sale rate: 1 {networkSymbol} = {saleRate == 0 ? 'X' : saleRate}  {tokenSymbol}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='py-4 mt-2'>
                                            <label className="block text-base font-medium text-gray-900 dark:text-gray-300">
                                                Set token sale raised amount caps
                                            </label>
                                        </div>
                                        <div className='flex flex-row'>
                                            <FeatherIcon icon="alert-circle" size="30px" className="text-gray-500"></FeatherIcon>
                                            <p className="ml-2 text-xs text-gray-400">
                                                Only enter whole numbers. Soft cap must be at least 50% of hard cap.
                                                If the soft cap is not reached at the end of the token sale,
                                                funds are sent back to investors automatically.
                                            </p>
                                        </div>
                                        <div className=' mt-3' >

                                            <label for="hardCap" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Hard cap in {networkSymbol}<span className="text-red-600">*</span></label>
                                            <input
                                                type="number"
                                                name="hardCap"
                                                id="hardCap"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="eg. 100"
                                                onBlur={handleBlur}
                                                value={values.hardCap}
                                                onChange={handleChange}
                                                required
                                            />

                                            {errors.hardCap && touched.hardCap && (
                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.hardCap}</div>
                                            )}

                                        </div>
                                        <div>
                                            <label for="softCap" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Soft cap in {networkSymbol}<span className="text-red-600">*</span></label>
                                            <input
                                                type="number"
                                                name="softCap"
                                                id="softCap"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="eg. 50"
                                                onBlur={handleBlur}
                                                value={values.softCap}
                                                onChange={handleChange}
                                                required
                                            />

                                            {errors.softCap && touched.softCap && (
                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.softCap}</div>
                                            )}

                                        </div>
                                    </div>
                                    <div className='py-2 flex flex-row'>
                                        <FeatherIcon icon="disc" size="17px" className="text-gray-500" ></FeatherIcon>
                                        {/* <NFTComponent/> */}
                                        <p className=" block ml-2.5 text-sm font-medium text-gray-500 dark:text-gray-300">
                                            Number of tokens on sale: {tokenSymbol} {tokenOnSale}
                                        </p>
                                    </div>
                                    <div>
                                        <div className='py-4 mt-2'>
                                            <label className="block text-base font-medium text-gray-900 dark:text-gray-300">
                                                Set investment amount limits per investor
                                            </label>
                                        </div>
                                        <div className='flex flex-row'>
                                            <FeatherIcon icon="alert-circle" size="20px" className="text-gray-500"></FeatherIcon>
                                            <p className="ml-2 text-xs text-gray-400">
                                                These are the minimum and maximum amounts each wallet address can invest.
                                                Set to 0 for no limit.
                                            </p>
                                        </div>
                                        <div className=' mt-3' >

                                            <label for="minInvest" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Min investment amount in {networkSymbol}<span className="text-red-600">*</span></label>
                                            <input
                                                type="number"
                                                name="minInvest"
                                                id="minInvest"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="eg. 0"
                                                onBlur={handleBlur}
                                                value={values.minInvest}
                                                onChange={handleChange}
                                                required
                                            />

                                            {errors.minInvest && touched.minInvest && (
                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.minInvest}</div>
                                            )}

                                        </div>
                                        <div>
                                            <label for="maxInvest" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Max investment amount in {networkSymbol}<span className="text-red-600">*</span></label>
                                            <input
                                                type="number"
                                                name="maxInvest"
                                                id="maxInvest"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="eg. 0"
                                                onBlur={handleBlur}
                                                value={values.maxInvest}
                                                onChange={handleChange}
                                                required
                                            />

                                            {errors.maxInvest && touched.maxInvest && (
                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.maxInvest}</div>
                                            )}

                                        </div>
                                    </div>


                                </div>
                                {/* <div className="row-span-1 md:col-span-1 w-full my-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700 mx-auto"> */}
                                <div className="w-50 md:mx-3 md:w-full mt-5 bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700">
                                    <h5 className="text-center text-xl font-medium text-gray-900 dark:text-white"></h5>

                                    <br />

                                    <div>
                                        <div className='py-4 mt-2'>
                                            <label className="block text-base font-medium text-gray-900 dark:text-gray-300">
                                                Set the timing
                                            </label>
                                        </div>

                                        <label for="startTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Token sale start time<span className="text-red-600">*</span></label>

                                        <SelectDateTime id="startDate" name="startDate" setDateTime={setStartDate} onTimeChange={(values) => validate(values)} />
                                        {errors.startDate && touched.startDate && (
                                            <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.startDate}</div>
                                        )}
                                        <div>
                                            <label for="saleDuration" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Token sale duration in days<span className="text-red-600">*</span></label>
                                            <input
                                                type="number"
                                                name="saleDuration"
                                                id="saleDuration"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="eg. 0"
                                                onBlur={handleBlur}
                                                value={values.saleDuration}
                                                onChange={handleChange}
                                                required
                                            />

                                            {errors.saleDuration && touched.saleDuration && (
                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.saleDuration}</div>
                                            )}

                                        </div>
                                        <div className='py-2 flex flex-row'>
                                            <FeatherIcon icon="clock" size="15px" className="text-gray-500" ></FeatherIcon>
                                            <p className=" block ml-3 text-sm font-medium text-gray-500 dark:text-gray-300">
                                                Token sale end time: {endDate}
                                            </p>
                                        </div>
                                        <div>
                                            <label for="lockDuration" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Lock duration in days<span className="text-red-600">*</span></label>
                                            <input
                                                type="number"
                                                name="lockDuration"
                                                id="lockDuration"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="eg. 0"
                                                onBlur={handleBlur}
                                                value={values.lockDuration}
                                                onChange={handleChange}
                                                required
                                            />

                                            {errors.lockDuration && touched.lockDuration && (
                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.lockDuration}</div>
                                            )}

                                        </div>
                                        <div className='py-2 flex flex-row'>
                                            <FeatherIcon icon="clock" size="15px" className="text-gray-500" ></FeatherIcon>
                                            <p className=" block ml-3 text-sm font-medium text-gray-500 dark:text-gray-300">
                                                Token claim time: {claimDate}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex flex-row'>
                                        <FeatherIcon icon="alert-circle" size="20px" className="text-gray-500"></FeatherIcon>
                                        <p className="ml-2 text-xs text-gray-400">
                                            After token sale ends, token claiming is locked for this amount of days.
                                            Set to 0 for not locking tokens.
                                        </p>
                                    </div>
                                    <div className='my-4'>
                                        <label for="name" className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-300">
                                            Set investor whitelist</label>
                                        <div className='flex flex-row mb-2'>
                                            <input type="radio" value="Every address can invest" id="addressType" name="addressType" checked={addressType == "Every address can invest"} onChange={handleChange} /><p className="ml-2  text-sm font-medium text-gray-900 dark:text-gray-300" >Every address can invest</p>
                                        </div>
                                        <div className='flex flex-row'>
                                            <input type="radio" value="Only whitelisted addresses can invest" id="addressType" name="addressType" checked={addressType == "Only whitelisted addresses can invest"} onChange={handleChange} /><p className="mx-2  text-sm font-medium text-gray-900 dark:text-gray-300" >Only whitelisted addresses can invest</p>
                                            <div class="tooltipsmp mx-2">
                                                <FeatherIcon icon="alert-circle" size="18px" className="text-gray-500"></FeatherIcon>
                                                <span className="tooltiptxt min-w-max  bg-gray-500 border border-gray-300  text-sm">
                                                    Whitelist addresses in the <br /> Manage Token Sale section.
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                    <div className='my-4'>
                                        <label for="name" className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-300">
                                            Set token sale owner</label>
                                        <div>
                                            <label for="ownerAddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Token sale owner address<span className="text-red-600">*</span></label>
                                            <input
                                                type="text"
                                                name="ownerAddress"
                                                id="ownerAddress"

                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                onBlur={handleBlur}
                                                value={values.ownerAddress}
                                                onChange={handleChange}
                                                required
                                            />

                                            {errors.ownerAddress && touched.ownerAddress && (
                                                <div className="block mb-2 text-sm font-medium text-red-900 dark:text-red-300">{errors.ownerAddress}</div>
                                            )}

                                        </div>

                                    </div>

                                    {isloading ? <div className="cover-spin flex justify-center items-center">

                                        <Loader type={'spinningBubbles'} color="#ed8936" />

                                    </div> :
                                        <button disabled={!(dirty && isValid)} className={`w-full rounded text-white h-10 ${!(dirty && isValid) ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500"}`}>Continue</button>}
                                </div>

                            </div>
                        </form>
                    )
                }
            </Formik>

        </>

    )

}
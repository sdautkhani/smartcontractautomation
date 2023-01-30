import FeatherIcon from "feather-icons-react";
import { useEffect, useState } from "react";
import Loader from 'react-loading';
import { useWeb3React } from '@web3-react/core';
import { recheckURL } from "../../helpers/Networks";
import {
    USER_BASE_URL,
    globalService,
    GET_CONTRACT_VALUE,
    GassFeeCalculation
} from "../../helpers";
import SummaryLabelValue from "../SummaryLabelValue/SummaryLabelValue";
const Web3 = require('web3');

export default function NFTDistributionSummery({ tokenList, contractAddress }) {
    const { library,account,chainId } = useWeb3React();
    const web3 = new Web3(library?.provider);
    const [accountBalance, setAcctBal] = useState("");
    const [contractBalance, setContractBal] = useState("");
    const [symbol, setSymbol] = useState("");
    const [networkType, setNetworkType] = useState("standard")
    const [txHash, setTxhash] = useState("");
    const [gassvalue, setgassvalue] = useState("");
    const [tokens, settokens] = useState([]);
    const [isloading, setLoading] = useState(false);
    const [isbtnDelete, setbtnDelete] = useState(true);
    const [isBtnDisable, setisBtnDisable] = useState(true);
    const [networkUrl,setNetworkUrl]=useState(recheckURL[web3.utils.toHex(chainId)])
    const tokenStandard = sessionStorage.getItem("tokenStandard");

    useEffect(async () => {
        handleButtons(tokenList)

    }, [tokenList])
    
    useEffect(async () => {
        if (contractAddress != "") {
            console.log(networkUrl);
            const acbal = await web3.eth.getBalance(account);
            setAcctBal(acbal / Math.pow(10, 18)); 
            estimatedGasCalC();
        }
    }, [contractAddress])
    const estimatedGasCalC=async()=>{
        const user = JSON.parse(sessionStorage.getItem("user"));
        try {
            let reqObj = {
                method: "GET",
                headers: { "authorization": `Bearer ${user.token}` },
                url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/${tokenStandard}`,

            };

            var resp = await globalService(reqObj);
           
            if (resp != null) {
                const tokenInst = new web3.eth.Contract(resp.contractABI, contractAddress); 
                if (tokenStandard == "erc721") {              
                const contractBal = await tokenInst.methods.balanceOf(account).call();
                setContractBal(contractBal);
                }
               const symbol = await tokenInst.methods.symbol().call();
                setSymbol(symbol);
                console.log(tokenList);
                if (Object.keys(tokenList).length > 0) {

                    var addressList = [];
                    var tokenIDList = [];
                    var amountList = [];

                    tokenList.map((item) => {
                        if(item.isAvailable=="Available"){
                        addressList.push(item.address);
                        tokenIDList.push(parseInt(item.tokenID));
                        }
                        if (tokenStandard == "erc1155"){
                            amountList.push(parseInt(item.amount));
                        } 
                      
                    })
                    
                        var gassFeeParams = {}

                        if (tokenStandard == "erc721") {
                            gassFeeParams = {
                                contractABI: resp.contractABI,
                                contractAddress: contractAddress,
                                addressList: addressList,
                                tokenIDList: tokenIDList,
                                account: account,
                                provider:library?.provider,
                                methodName: "batchTransfer"
                            }
                        } else {
                            gassFeeParams = {
                                contractABI: resp.contractABI,
                                contractAddress: contractAddress,
                                addressList: addressList,
                                tokenIDList: tokenIDList,
                                amountList: amountList,
                                account: account,
                                provider:library?.provider,
                                methodName: "batchTransferERC1155"
                            }
                        }
                        GassFeeCalculation(gassFeeParams).then((finalGasInEther) => {
                            setgassvalue(finalGasInEther);
                            console.log(finalGasInEther);
                        }).catch((ex) => {
                            console.log(ex);
                        })

                }
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    const handleButtons=(tokenListObj)=>{
        settokens(tokenListObj);
        if (tokenListObj.length > 1) {
            setbtnDelete(true)
        } else {
            setbtnDelete(false)
        }
        
        if(tokenListObj.length>0){
            let index =tokenListObj.findIndex(item=>item.isAvailable=="Unavailable");
            console.log("index",index)
            if(index>-1){
                setisBtnDisable(true);
            }else{
                setisBtnDisable(false);
                
            }
        }
       
    }
    const RemoveToken = (tokenName) => {
        let tempTokenList = tokens;
        let index = tempTokenList.findIndex((item) => { return item.tokenName == tokenName });
        if (index > -1) {
            tempTokenList.splice(index, 1);
            
            handleButtons(tempTokenList)

        }
    }
    const handleDistribution = async () => {
        setLoading(true);
        var addressList = [];
        var tokenIDList = [];
        var amountList = [];

        tokenList.map((item) => {
            addressList.push(item.address);
            tokenIDList.push(item.tokenID);
            if (tokenStandard == "erc1155") {
              amountList.push(item.amount);
            }
        })
        const user = JSON.parse(sessionStorage.getItem("user"));
        
        let reqObj = {
            method: "GET",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${GET_CONTRACT_VALUE}/${tokenStandard}`,

        };

        var resp = await globalService(reqObj);
        if(resp!=null){
            try{
                
                const tokenInst = new web3.eth.Contract(resp.contractABI, contractAddress);
                if (tokenStandard == "erc721") {
               
                        tokenInst.methods.batchTransfer(addressList, tokenIDList).send({
                            from: account
                         }
                        ).on('transactionHash', function(hash){
                           setTxhash(hash);
                           setLoading(false);
                        })
                        .on('error',function(error){
                                     setTxhash("");
                                     setLoading(false);
            
                        });
                    }else{
                        tokenInst.methods.batchAddressTransfer(account,addressList, tokenIDList,amountList).send({
                            from: account
                         }
                        ).on('transactionHash', function(hash){
                           setTxhash(hash);
                           setLoading(false);
                        })
                        .on('error',function(error){
                                     setTxhash("");
                                     setLoading(false);
            
                        });
                    }
                    }catch(ex){
                        console.log(ex);
                    }
                    
                        
                    
        }

    }
    return (
        <>
            {tokenList &&
                <div className="w-full my-6 bg-white rounded-lg border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 dark:bg-gray-800 dark:border-gray-700 mx-auto">


                    <div className="intro-x text-center xl:text-left">
                        <div className="form-check  items-baseline mt-4">

                            <ul className="nav nav-pills nav-justified flex flex-col md:flex-row flex-wrap list-none pl-0 mb-4"
                                id="pills-tabJustify" role="tablist">

                                <li className="nav-item flex-grow text-center my-2 md:mx-2" role="presentation">
                                    <a href="#pills-profileJustify" className="
                                
                                    nav-link
                                    w-90
                                    block
                                    font-medium
                                    text-xs
                                    leading-tight
                                    uppercase
                                    rounded
                                    px-6
                                    py-3
                                    focus:outline-none focus:ring-0
                                    " id="pills-profile-tabJustify" data-bs-toggle="pill" data-bs-target="#pills-profileJustify" role="tab"
                                        aria-controls="pills-profileJustify" aria-selected="false" onClick={() => { setNetworkType("slow") }}>Slow</a>
                                </li>
                                <li className="nav-item flex-grow text-center my-2 md:ml-2" role="presentation">
                                    <a href="#pills-contactJustify" className="
                                active
                                nav-link
                                w-90
                                block
                                font-medium
                                text-xs
                                leading-tight
                                uppercase
                                rounded
                                px-6
                                py-3
                                focus:outline-none focus:ring-0
                                " id="pills-contact-tabJustify" data-bs-toggle="pill" data-bs-target="#pills-contactJustify" role="tab"
                                        aria-controls="pills-contactJustify" aria-selected="false" onClick={() => { setNetworkType("standard") }}>Standard</a>
                                </li>
                                <li className="nav-item flex-grow text-center my-2 md:ml-2" role="presentation">
                                    <a href="#pills-contactJustify" className="
                                    nav-link
                                    w-90
                                    block
                                    font-medium
                                    text-xs
                                    leading-tight
                                    uppercase
                                    rounded
                                    px-6
                                    py-3
                                    focus:outline-none focus:ring-0
                                    " id="pills-billing-tabJustify" data-bs-toggle="pill" data-bs-target="#pills-billingJustify" role="tab"
                                        aria-controls="pills-billing-tabJustify" aria-selected="false" onClick={() => { setNetworkType("fast") }}>Fast</a>
                                </li>

                            </ul>

                            <div className="mt-9" >
                                <h5 className="text-left text-xl font-medium text-gray-900 dark:text-white"> List Of Recipients</h5>
                                {
                                    tokens.length >= 0 ?
                                        <div className='overflow-x-auto relative bg-white shadow-md rounded-lg'>
                                            <table className='w-full'>
                                            <thead>
                                                <tr id="" className='shadow'>
                                                    <th className='userth font-medium text-center' > Address</th>
                                                    <th className='userth font-medium text-center' >Token ID</th>
                                                    {tokenStandard=='erc1155' && <th className='userth font-medium text-center'>Amount</th>}
                                                    <th className='userth font-medium text-center' >Status</th>
                                                    <th className='userth font-medium text-center'>Remove</th>

                                                </tr>
                                                </thead>
                                                {tokens.map((val, key) => {
                                                    return (
                                                        <tbody className='rotate-45' key={key}>
                                                        <tr key={key} className='shadow hover:bg-gray-50 ' >
                                                            <td  className='usertd'>{val.address}</td>
                                                            <td  className='usertd'>{val.tokenID}</td>

                                                            {tokenStandard=='erc1155' && <td  className='usertd'>{val.amount}</td>}

                                                            <td  className='usertd'>{val.isAvailable}</td>   
                                                            <td  className='usertd'>

                                                                {isbtnDelete && <a href='#' className='text-blue-500' onClick={() => { RemoveToken(val.tokenName) }}><FeatherIcon icon="trash-2" color="blue" size="20px" className="ml-6" ></FeatherIcon> </a>}

                                                            </td>

                                                        </tr>
                                                        </tbody>
                                                    )
                                                })}
                                            </table>
                                        </div>
                                        : null
                                }
                            </div>
                            <div className="mt-9" >
                                <hr></hr>
                                <h5 className="text-left text-xl font-medium text-gray-900 dark:text-white py-4"> Summary</h5>

                                <SummaryLabelValue label='Total number of addresses' value={Object.keys(tokenList).length} width='w-2/5' />
                                {tokenStandard == 'erc721' ?
                                    <SummaryLabelValue label='Total number of tokens to be sent' value={`${Object.keys(tokenList).length} ${symbol}`} width='w-2/5' />
                                    :
                                    <SummaryLabelValue label='Total number of tokens to be sent' value={`${tokenList.reduce((n, { amount }) => parseInt(n) + parseInt(amount), 0)} ${symbol}`} width='w-2/5' />
                                }
                                <SummaryLabelValue label='Total number of transactions needed' value={1} width='w-2/5' />
                               {tokenStandard == "erc721" && <SummaryLabelValue label='Your token balance' value={`${contractBalance} ${symbol}`} width='w-2/5' />}
                                <SummaryLabelValue label='Approximate cost of operation' value={`${gassvalue} ETH`} width='w-2/5' />
                                <SummaryLabelValue label='Your ETH balance' value={`${accountBalance} ETH`} width='w-2/5' />

                            </div>


                            {txHash == "" ?
                                <>
                                    {
                                        isloading ?
                                            <div className="flex justify-center items-center">
                                                < Loader type={'spinningBubbles'} color={"#ed8936"} height={60} width={60} />
                                            </div> :
                                            <div className='flex justify-center items-center'>
                                                <button type='submit'
                                                    className={`w-1/2 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded mt-9 ${isBtnDisable ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 "}`}
                                                    onClick={handleDistribution} disabled={isBtnDisable}>
                                                    Approve
                                                </button>
                                            </div>}
                                </>

                                :
                                <div> transactions successfull with Transaction ID <a className="underline text-blue-500" target="_blank" href={networkUrl+"/tx/"+ txHash}>{txHash}</a></div>
                            }

                        </div>


                    </div>
                </div >}
        </>
    )

}
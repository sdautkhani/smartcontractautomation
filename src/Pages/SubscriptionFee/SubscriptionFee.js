import React, { useState, useEffect } from 'react';
import Select from 'react-select'
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import FeatherIcon from "feather-icons-react";
//import "./SubscriptionFee.scss";
import {
    USER_BASE_URL,
    globalService,
    UPDATE_SUBSCRIPTION_FEE_URL,
    SUBSCRIPTION_FEE_URL
} from "../../helpers";
export default function SubscriptionFee() {
    const contractTypeItems = [
        
        { value: "simple", label: "SimpleERC20" },
        { value: "hello", label: "HelloERC20" },
        { value: "standard", label: "StandardERC20" },
        { value: "burnable", label: "BurnableERC20" },
        { value: "mintable", label: "MintableERC20" },
        { value: "pausable", label: "PausableERC20" },
        { value: "common", label: "CommonERC20" },
        { value: "unlimited", label: "UnlimitedERC20" },
    
    ];
    const networkItems = [
        { value: "Polygon", label: "Polygon", chainId: "0x89" },
        { value: "Polygon Testnet", label: "Polygon Testnet", chainId: "0x13881" },
        // { value: "ropsten", label: "Ropsten Test Network", chainId: "0x3" },
        { value: "Bsc Test Network", label: "Bsc Test Network", chainId: "0x61" },
        { value: "Avalanche Fuji Testnet", label: "Avalanche Fuji Testnet", chainId: "0xa869" },
        { value: "Goerli Testnet", label: "Goerli Testnet", chainId: "0x5" }
    ];
    const navigate = useNavigate();
    const [showPopup, setPopup] = useState(false);
    const [formValues, setFormValue] = useState({ fees: '' });
    const [refreshData, setRefreshData] = useState(true);
    const [contractType, setcontractType] = useState(contractTypeItems[0]);
    const [network, setnetwork] = useState(networkItems[4]);
    const [subscriptionList, setsubscriptionList] = useState([]);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValue({ ...formValues, [name]: value });
    }
    const handleViewDetails = () => {
        setPopup(!showPopup);
      }
    const getSubsFee = async () => {
        var config = {
            method: "GET",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${SUBSCRIPTION_FEE_URL}`,

        };
        try {
            const resp = await globalService(config);
            if (resp == "Unauthenticated request") {
                navigate("/");
            } else {
                setsubscriptionList(resp);
            }


        } catch (e) {
            throw e;
        }

    }
    useEffect(async () => {
        getSubsFee();
        setRefreshData(false);
    }, [refreshData])

    const handleSubmit = async (e) => {
       // e.preventDefault();
        formValues.contract_type = contractType.label;
        formValues.status = 1;
        formValues.userName = user.username;
        formValues.network = network.label;
        var config = {
            method: "POST",
            headers: { "authorization": `Bearer ${user.token}` },
            url: `${USER_BASE_URL}/${UPDATE_SUBSCRIPTION_FEE_URL}`,
            data: formValues,
        };
        console.log(config);

        try {
            const resp = await globalService(config);
            console.log(Object.keys(resp).length);
            if (Object.keys(resp).length > 0) {
                if (resp.status == 0) {
                    navigate("/");
                } else {

                    toast.success(resp.msg)
                    getSubsFee();
                    setPopup(false);
               // form.setRefreshData(true);
                }

            }


        } catch (err) {
            toast.error("Subscription Update Fail");
            console.log(err);
        }


    }
    return (
        <>

        {/* <div className='container max-w-xxl mx-auto'> */}
       
        <p className='text-2xl font-medium'> Subscription Fee</p>
                
                <div className="intro-x  text-center sm:text-right py-2">
                    <button type='submit' onClick={() => setPopup(true)} className="w-sm bg-gray-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded mt-9">
                        Add Subscription Fee
                    </button>

                
                </div>
                <div className='mt-5'>

              <div className='overflow-x-auto relative shadow-md rounded-lg'>
                   

                    <table className='w-full'>
                        <tr className=' py-4 w-full mr-4'>
                            <th  className='userth' >Contract Type</th>
                            <th  className='userth'>Network Type</th>
                            <th  className='userth'>Fees</th>
                            <th  className='userth'>Updated By</th>
                            <th  className='userth'>Updated On</th>

                        </tr>
                        {subscriptionList.map((val, key) => {
                            return (
                                <tr  key={key} >
                                    <td  className='usertd '>{val.contractType}</td>
                                    <td  className='usertd '>{val.network}</td>
                                    <td  className='usertd '>${val.feeIn$}</td>
                                    
                                    <td  className='usertd '>{val.updatedBy}</td>
                                    <td  className='usertd '>{val.updatedOn}</td>



                                </tr>
                            )
                        })}
                    </table>
                    </div>
                </div>
                {showPopup &&
                    <div className='popup'>
                        <div className='popup_inner  max-w-sm'>
                            <div class="px-10">

                                {/* <h5 class="text-xl font-medium text-gray-900 dark:text-white ml-8"></h5> */}

                                <div className='py-4 flex flex-row justify-between items-center cursor-pointer'
                                    onClick={(e) => { handleViewDetails() }}>
                                    <p className='font-semibold text-xl tracking-tight'>Add Subscription Fee</p>
                                    <FeatherIcon icon="x" size="20px" />
                                </div>

                                {/* <div className='head font-semibold text-xl tracking-tight'>Add Subscription Fee</div> */}
                                <form name="form" className='block mt-6 ml-8' onSubmit={handleSubmit} >
                                    <div className="py-2">
                                        <label for="supplyType" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contract Type</label>
                                        <Select
                                            defaultValue={contractTypeItems[0]}
                                            options={contractTypeItems}
                                            onChange={value => setcontractType(value)}
                                            classNamePrefix='supply-type'
                                            className='text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-60 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
                                            components={{
                                                IndicatorSeparator: () => null
                                            }}
                                            inputProps={{ autoComplete: 'off', autoCorrect: 'off', spellCheck: 'off' }}
                                        />
                                    </div>
                                    <div className="py-2">
                                        <label for="supplyType" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Network Type</label>
                                        <Select
                                            defaultValue={networkItems[4]}
                                            options={networkItems}
                                            onChange={value => setnetwork(value)}
                                            classNamePrefix='supply-type'
                                            className='text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-60 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
                                            components={{
                                                IndicatorSeparator: () => null
                                            }}
                                            inputProps={{ autoComplete: 'off', autoCorrect: 'off', spellCheck: 'off' }}
                                        />
                                    </div>
                                    <div className="py-2">

                                        <label for="fees" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Fees(In $)</label>
                                        <input
                                            type="text"
                                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-60 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
                                            placeholder="Fees in Dollers"
                                            name="fees"
                                            value={formValues.fees}
                                            onChange={handleChange}
                                        />

                                    </div>
                                    <div className="intro-x  text-center sm:text-left">
                                        <button type='submit' className="w-sm bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-9">
                                            Submit
                                        </button>
                                        <span></span>
                                        <button type='submit' onClick={() => setPopup(false)} className="w-sm bg-gray-400 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-9">
                                            Cancel
                                        </button>

                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                }
            {/* </div> */}
        </>
    )
}
import React, { useState, useEffect } from 'react';
import Pagination from '@material-ui/lab/Pagination';
import Select from 'react-select'
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import Loader from 'react-loading';
import NoData from "../../components/NoData";
import {
  notify,
  USER_BASE_URL,
  globalService,
  GET_TOKEN_LIST,
  UPDATE_TOKEN_STATUS,
  GET_USER_TOKEN_URL
} from "../../helpers";
//import "./TokenList.scss";
import { useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";


export const FormContext = React.createContext();

export default function TokenList() {

  const navigate = useNavigate();
  const { userName } = useParams();
  const [showPopup, setPopup] = useState(false);
  const [data, setData] = useState([]);
  const [tokenDtl, setTokenDetails] = useState();
  const [billingDtl, setBillingDetails] = useState();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [curentPage, setcurrentpg] = useState(1);
  const [pageCount, setPgCount] = useState(1);
  const [showPagination, setshowPagination] = useState(false);
  const [isloading, setLoading] = useState(true);
  const statusItem = [
    { value: "Pending", label: "Pending" },
    { value: "Deployed", label: "Deployed" },
    { value: "Verified", label: "Verified" },
    { value: "Rejected", label: "Rejected" },
  ];
  const [status, setStatus] = useState(0);
  const [index, setIndex] = useState(0);

  const handleCheckboxChange = (id) => {


    if (!showPopup) {
      setIndex(statusItem.findIndex((data) => { return (data.value == id.status) }));
      setStatus(id.status);
      setTokenDetails(id);
      setBillingDetails(id.billingDetails[0])
    } else {
      setTokenDetails(null);
      setBillingDetails(null)
    }

    setPopup(!showPopup);
  }
  const handleViewDetails = (id) => {
    console.log("pop", id);
    if (!showPopup) {
      setTokenDetails(id);
      setBillingDetails(id.billingDetails[0])
    } else {
      setTokenDetails(null);
      setBillingDetails(null)
    }

    setPopup(!showPopup);
  }

  const handleChange = (event, value) => {
    setcurrentpg(value);
  };
  useEffect(async () => {
    var config = {
      method: "GET",
      headers: { "authorization": `Bearer ${user.token}` },

    };

    if (userName == "all") {

      config.url = `${USER_BASE_URL}/${GET_TOKEN_LIST}/${curentPage}`;

    } else {
      config.url = `${USER_BASE_URL}/${GET_USER_TOKEN_URL}/${userName}/${curentPage}`;

    }

    try {
      const resp = await globalService(config);
      if (resp == "Unauthenticated request") {
        navigate("/");
      } else {
        if (Object.keys(resp.metadata).length > 0) {
          if (resp.metadata[0].numberOfPages > 1) {
            setshowPagination(true);
          }
          setPgCount(resp.metadata[0].numberOfPages)
        }
        if (Object.keys(resp.data).length > 0) {
          setData(resp.data);
        }

      }
      setLoading(false);

    } catch (err) {
      setLoading(false);
      console.log(err);
    }

  }, [curentPage, userName]);

  const saveStatusChange = async () => {
    console.log(tokenDtl._id);
    console.log(status);
    var config = {
      method: "POST",
      headers: { "authorization": `Bearer ${user.token}` },
      url: `${USER_BASE_URL}/${UPDATE_TOKEN_STATUS}`,
      data: { "id": tokenDtl._id, "status": status, "userName": user.username, "remarks": "Changes by Admin" }

    };

    try {
      const resp = await globalService(config);
      if (resp == "Unauthenticated request") {
        navigate("/");
      } else {

        toast.success(resp.msg)
      }


    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      {/* <div className='container max-w-xxl mx-auto'> */}
      <p className='text-2xl font-medium'> Token Details </p>
      {isloading ?
        <div className="cover-spin flex justify-center items-center">
          <Loader type={'spinningBubbles'} color="#ed8936">
          </Loader>
        </div>
        :
        <>
         {Object.keys(data).length != 0 ?
        <div className='mt-5'>
          <div className='overflow-x-auto relative shadow-md rounded-lg'>
            <table className='w-full'>
              <tr className=' py-4 w-full mr-4'>
                <th className='userth' >Token Name</th>
                <th className='userth'>Token Decimal </th>
                <th className='userth'>Token Supply</th>
                <th className='userth'>Status</th>
                <th className='userth'>Created On</th>
                <th className='userth'>Metamask Token</th>
                <th className='userth'>View</th>

              </tr>
              {data.map((val, key) => {
                return (
                  <tr id={key}>
                    <td className='usertd'> <a href='#' className='text-blue-500' onClick={() => { handleCheckboxChange(val) }}>{val.tokenName}</a></td>
                    <td className='usertd px-8'>{val.tokenDecimal}</td>
                    <td className='usertd px-8'>{val.tokenSupply}</td>
                    <td className={`usertd ${val.status == "Deployed" ? "text-green-500" : "text-red-500"}`}>{val.status}</td>
                    <td className='usertd px-4'>{val.createdOn}</td>
                    <td className='usertd px-8'>{val.isMetamask}</td>
                    <td className='usertd px-4'>
                      {val.status == 'Deployed' && <a target="_blank" href={"https://ropsten.etherscan.io/tx/" + val.txHash}>
                        <img className='icon w-5' src="./../../assets/icons/etherscan-logo-circle.svg" alt="" /></a>}
                    </td>

                  </tr>
                )
              })}
            </table>
          </div>

          {showPagination &&
            <div className='flex items-center justify-center'>
              <Pagination count={pageCount} color="primary" onChange={handleChange} />
            </div>
          }

        </div>
         :
         <NoData />
        }
        </ >
      }
      {/* </div> */}
      {showPopup &&
       <div className='popup'>
       <div className='popup_inner p-2'>
         <div className='py-4 flex flex-row justify-between items-center cursor-pointer'
           onClick={(e) => { handleViewDetails({ tokenDtl }) }}>
           <p className='font-semibold text-xl tracking-tight'>{tokenDtl.tokenName}</p>
           <FeatherIcon icon="x" size="20px" />
         </div>

         <div className=' mx-auto'>

           <ul className="nav nav-pills nav-justified flex flex-col md:flex-row flex-wrap list-none pl-0 mb-4"
             id="pills-tabJustify" role="tablist">
             <li className="nav-item flex-grow text-center my-2 mr-2" role="presentation">
               <a href="#pills-homeJustify" className={`
                     active
                       nav-link
                       w-90
                       block
                       font-medium
                       text-xs
                       leading-tight
                       uppercase
                       rounded
                       px-2
                       py-3
                       focus:outline-none focus:ring-0
                       
                     `} id="pills-home-tabJustify" data-bs-toggle="pill" data-bs-target="#pills-homeJustify" role="tab"
                 aria-controls="pills-homeJustify" aria-selected="false">Token Details</a>
             </li>
             <li className="nav-item flex-grow text-center my-2" role="presentation">
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
                 aria-controls="pills-profileJustify" aria-selected="false" >Billing Details</a>
             </li>


           </ul>

           <div className="tab-content" id="pills-tabContentJustify">
             <div className="tab-pane fade show active" id="pills-homeJustify" role="tabpanel" aria-labelledby="pills-home-tabJustify">

               <table className='m-4'>
                 <tbody>
                   <tr>
                     <td className='modaldata'>Token Name </td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.tokenName}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Token Symbol </td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.tokenSymbol}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Token Decimal </td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.tokenDecimal}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Initial Supply </td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.initialSupply}</td>
                   </tr>

                   <tr>
                     <td className='modaldata'>Token Supply</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.tokenSupply}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Supply Type</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.supplyType}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Access Type</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.accessType}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Transfer Type</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.transferType}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Varify Source</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.varifySource ? "Enabled" : "Disabled"}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Remove Copy</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.removeCopy ? "Enabled" : "Disabled"}</td>
                   </tr>

                   <tr>
                     <td className='modaldata'>Burnable</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.burnable ? "Enabled" : "Disabled"}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Mintable</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.mintable ? "Enabled" : "Disabled"}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>ERC</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.erc ? "Enabled" : "Disabled"}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Token Type</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.tokenType}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Network</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.network}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Status</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.status}</td>
                   </tr>

                   <tr>
                     <td className='modaldata'>User Name</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.userName}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Commision Fee</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.commisionFee}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Gas Fee</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.gasFee}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Subscription Fee</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.subscriptionFee}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>Contract Address</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.contractAddress}</td>
                   </tr>
                   <tr>
                     <td className='modaldata'>txHash</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.txHash == "" ? "NA" : tokenDtl.txHash}</td>
                   </tr>
                   {tokenDtl.contractAddress != null ?
                     <tr>
                       <td className='modaldata'>Reason</td>
                       <td className='px-5'>:</td>
                       <td className='py-3' >{tokenDtl.reason == "" ? "NA" : tokenDtl.reason}</td>
                     </tr>
                     : null}
                   <tr>
                     <td className='modaldata'>Metamask Token</td>
                     <td className='px-5'>:</td>
                     <td className='py-3' >{tokenDtl.isMetamask}</td>
                   </tr>
                 </tbody>
               </table>

             </div>

             {billingDtl ?
               <div className="tab-pane fade " id="pills-profileJustify" role="tabpanel" aria-labelledby="pills-profile-tabJustify">
                 <table className='m-4'>
                   <tbody>
                     <tr>
                       <td className='modaldata'>Creator Wallet Address </td>
                       <td className='px-5'>:</td>
                       <td className='py-3' >{billingDtl.walletAddress}</td>
                     </tr>
                     <tr className='p-2'>
                       <td className='modaldata'>Creator or Business Legal Name  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3'>{billingDtl.legalName}</td>
                     </tr>
                     <tr className='p-2'>
                       <td className='modaldata'>Email Id  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3'>{billingDtl.emailid}</td>
                     </tr>
                     <tr className='p-2'>
                       <td className='modaldata'>Billing Address  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3' >{billingDtl.billingAddress}</td>
                     </tr>
                     <tr className='p-2'>
                       <td className='modaldata'>Zip/Postal Code  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3' >{billingDtl.zipCode}</td>
                     </tr>
                     <tr className='p-2'>
                       <td className='modaldata'>Country/Region  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3'>{billingDtl.country}</td>
                     </tr>
                     <tr className='p-2'>
                       <td className='modaldata'>State  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3'>{billingDtl.state}</td>
                     </tr>

                     <tr className='p-2'>
                       <td className='modaldata'>City  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3'>{billingDtl.city}</td>
                     </tr>
                     <tr className='p-2'>
                       <td className='modaldata'>Tax ID Code  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3'>{billingDtl.taxId}</td>
                     </tr>
                     <tr className='p-2'>
                       <td className='modaldata'>VAT or Tax Registration Number  </td>
                       <td className='px-5'>:</td>
                       <td className='py-3' >{billingDtl.taxRegNumber}</td>
                     </tr>
                   </tbody>

                 </table>

               </div>
               :
               <div className="tab-pane fade" id="pills-profileJustify" role="tabpanel" aria-labelledby="pills-profile-tabJustify">
                 No Data Found!
               </div>
             }
           </div>
           {/* </Formik> */}

         </div>

         {/* </div> */}

         {/* <button onClick={(e) => { handleViewDetails({ tokenDtl }) }} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-9 ml-9">Close</button> */}
       </div>
     </div>
            }

    </>

  )
}

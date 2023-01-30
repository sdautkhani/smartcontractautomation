import React, { useEffect, useState } from 'react';
import Pagination from '@material-ui/lab/Pagination';
import { NavLink } from "react-router-dom";
import Loader from 'react-loading';
import NoData from "../../components/NoData";
import "./UsersDetail.scss";
import {
  USER_BASE_URL,
  globalService,
  GET_USER_DETAILS,
  MiddleEllipsis
} from "../../helpers";

export default function UsersDetail() {
  const [data, setData] = useState([]);
  const [currrentPg, setcurrrentPg] = useState(1);
  const [totalPg, setTotalPg] = useState(1);
  const [showPagination, setshowPagination] = useState(false);
  const [isloading, setLoading] = useState(true);

  useEffect(async () => {
    console.log(currrentPg);
    var config = {
      method: "GET",
      url: `${USER_BASE_URL}/${GET_USER_DETAILS}/${currrentPg}`,
    };


    try {
      const resp = await globalService(config);
      if (Object.keys(resp.metadata).length > 0) {
        if (resp.metadata[0].numberOfPages > 1) {
          setshowPagination(true);
        }
        setTotalPg(resp.metadata[0].numberOfPages)
      }
      if (Object.keys(resp.data).length > 0) {
        setData(resp.data);
      } else {
        alert("No Record Found...!");
      }
      setLoading(false);




    } catch (err) {
      console.log(err);
    }

  }, [currrentPg])

  const handlePg = (event, value) => {
    setcurrrentPg(value);
    console.log(value);
  }

  return (
    <>
   <p className='text-2xl font-medium'>User Details</p>
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

                  <thead>
                    <tr>
                      <th className='userth' >Name</th>
                      <th className='userth'>UserName </th>
                      <th className='userth'>Email Id</th>
                      <th className='userth'>Country</th>
                      <th className='userth'>Metamask User</th>
                      <th className='userth'>View   </th>
                     
                    </tr>
                  </thead>
                  {data.map((val, key) => {
                    return (
                      <tbody>
                        <tr id={key} >
                          
                          <td className='usertd'>{(val.firstName== null && val.lastName==null)? '-':val.firstName + ' '+ val.lastName}</td>
                          <td className='usertd'>{val.isMetamask== "Metamask"?MiddleEllipsis(val.userName, 16):val.userName}</td>
                          <td className='usertd'>{val.email_id==null ?"-":val.email_id}</td>
                          <td className='usertd'>{Object.keys(val.userCountry).length==0?'-': val.userCountry[0].countryName}</td>
                          <td className='usertd'>{val.isMetamask}</td>
                          <td className='usertd'>
                            <div className='ml-6'>
                            <NavLink to={`/tokenDetails/${val._id}`}>
                              <img className='icon'  src="./../../assets/icons/eye.svg" alt="View Tokens"/>
                              </NavLink>
                              </div>
                          </td>
                          {/* <td className='usertd'>
                           
                            {val.status == 'Deployed' && <a target="_blank" href={val.baseurl + val.txHash}>
                              <img className='icon' src="../../assets/icons/eye.svg" alt="View Tokens" /></a>}
                            
                          </td> */}

                        </tr>
                      </tbody>
                    )
                  })}
                </table>
              </div>

              {showPagination &&
                <div className='flex items-center justify-center'>
                  <Pagination count={totalPg} color="primary" onChange={handlePg} />
                </div>}

            </div>
            :
            <NoData />
          }
        </>
      }
    </>

  )
}

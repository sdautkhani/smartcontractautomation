import React, { Component, useEffect, useState } from 'react';
import { Link,useNavigate } from 'react-router-dom'

import PropTypes from 'prop-types'

export default function Header({ connectWalletFn }) {
  const [usernm, setusernm] = useState("");
  const logOut=()=>{
    sessionStorage.clear();
    navigate("/");
  }
  const [showOptions, setShowOptions] = useState(false)
  const isDisplay=sessionStorage.getItem("user")==null ?false:true;
  console.log("isDisplay:",isDisplay);
  useEffect(()=>{
   
    if (sessionStorage.getItem("user") != null) {
     
      const user = JSON.parse(sessionStorage.getItem("user"));
      setusernm( user.username);
    }
  },[])
  const navigate=useNavigate();
  return (
    <div className='flex items-center justify-between '>
    <div className='flex flex-row'>
       {/* <p className='text-orange font-medium'>Admin &nbsp; </p> */}
     <p> Poly Automator</p>
    </div>
    <div className='flex flex-row items-center justify-center'>

 
      <div className='w-48 flex flex-col bg-blue-50 rounded-lg cursor-pointer' onClick={() => { setShowOptions(!showOptions) }}>
        <div className='flex flex-row items-center border-b border-white'>
        
        <span className='w-40 text-truncate text-center '>{usernm}</span>
        
       
        </div>
        {!showOptions ? null :
          <div className='h-10 flex items-center justify-center cursor-pointer' onClick={() => { logOut() }}>
            <p className=' text-sm text-yellow-500 text-center'>
              Sign Out
            </p>
          </div>
        }
      </div>
    </div>

  </div>
  )
}

Header.propTypes = {
  connectWalletFn: PropTypes.func,
}

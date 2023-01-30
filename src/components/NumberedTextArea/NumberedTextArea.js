import React, { useState, useRef, useEffect } from 'react'
var tokenAddressList = [];
export default function NumberedTextArea({ setTokenList, note, tokenStandard, uploadedData,setError }) {
  const [value, setvalue] = useState({ counter: 2, text: `1 ` });
 var errorCount=0;
  useEffect(() => {
    if (uploadedData != "") {

      let uplodedArray=uploadedData.split("\n");
      setvalue({ counter: uplodedArray.length+2, text: uploadedData });
      uplodedArray.forEach(element => {
        validation(uplodedArray,element,"uploaded");
      });
    }
  }, [uploadedData])

  useEffect(()=>{
    setTokenList(value.text);
  },[value])
  const onChange = (e) => {
    const {
      target: { value: currentValue },
    } = e;
    setvalue({ counter: value.counter, text: currentValue });
  
  };
  const validation=(tokenList,amt,type)=>{
    if (tokenList.length > 200) {
      setError("Tokens will be sent to batches of 200 addresses.");
      errorCount++;
      return false;
    } else if (!tokenList[tokenList.length - 1].toString().includes(",")) {
      errorCount++;
      switch (true) {
        case tokenStandard == "ERC721":
          setError("Use comma between addresses and TokenIDs.");
          return false;
        case tokenStandard == "ERC1155":
          setError("Use comma between addresses,TokenIDs and amounts.");
          return false;
        default:
          setError("Use comma between addresses and amounts.");
          return false;
      }
    } else {
      let tempAmt = [];
      if (tokenStandard == "ERC20") {
        tempAmt = amt.substring(amt.indexOf(",") + 1, amt.length);
      } else if (tokenStandard == "ERC1155") {
        tempAmt = amt.substring(amt.lastIndexOf(",") + 1, amt.length);
      }
      let tempaddress = amt.substring(amt.indexOf(" "), amt.indexOf(","));
      let contractAddress_regex = new RegExp('0x[a-fA-F0-9]{40}$');
      if (!contractAddress_regex.test(tempaddress)) {

        setError("Invalid Address.");
        errorCount++;
        return false;
      }
      if (tokenStandard != "ERC20") {
        let tempTokenID = "";
        if (tokenStandard == "ERC721") {
          tempTokenID = amt.substring(amt.indexOf(",") + 1, amt.length);
        } else {
          tempTokenID = amt.substring(amt.indexOf(",") + 1, amt.lastIndexOf(","));
        }
        let isduplicate=false;
        tokenAddressList.push(tempTokenID);
        isduplicate=tokenAddressList.some((element,index)=>{
          return tokenAddressList.indexOf(element)!=index;
        })
        if (isduplicate) {
          setError("Duplicate Token ID.");
          errorCount++;
          return false;
        }

        let contractAddress_regex = new RegExp('[0-9]*$');
        if (!contractAddress_regex.test(tempTokenID)) {

          setError("Invalid Token ID.");
          errorCount++;
          return false;
        }

      }
      if (isNaN(parseInt(tempAmt)) && (tokenStandard == "ERC20" || tokenStandard == "ERC1155")) {
        setError("Invalid amount.");
        errorCount++;
        return false;
      } else {
        if(errorCount==0 || type=="manual"){
          setError("");
        }
         
      }

    }

  }
  const _onKeyDown = (e) => {

    if (e.keyCode === 13) {
      let tokenList = value.text.split("\n");
      let amt = tokenList[tokenList.length - 1].toString();
      validation(tokenList,amt,"manual");
     
      updateCounter(amt);
     
      e.preventDefault();
      e.stopPropagation();
    }
  }
  const updateCounter = (list) => {
    let tempcount = list.substring(0, 1);
    let newTxt = "";
    let cnt = 0;
    if (value.counter != (parseInt(tempcount) + 1)) {
      cnt = parseInt(tempcount) + 1;
      newTxt = `${value.text}\n${cnt} `;

    } else {
      newTxt = `${value.text}\n${value.counter++} `;
      cnt = value.counter++;
    }

    setvalue({ counter: cnt, text: newTxt });
  }

  return (
    <>
    
    
      <textarea id="tokenDtls" name="tokenDtls" className='bg-gray-50 h-60 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
      ' value={value.text}
        onChange={(e) => onChange(e)} onKeyDown={_onKeyDown}>

      </textarea>

      <p className='mt-px clear-both text-xs text-gray-400'>{note}</p>
      
    </>
  );

}

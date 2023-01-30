import React, { useState } from 'react'
import Webform from '../../components/Webform';
import CreateERC from '../../components/CreateERC';
import ChangeNetwork from "../../components/ChangeNetwork";

export const FormContext = React.createContext();

export default function CreateTokens() {
  const [tokenStd, settokenstd] = useState("");

  return (
    <>
     <ChangeNetwork/>
      <p className='text-2xl font-medium'>Create Token</p>
      <ul className="nav nav-pills nav-justified flex flex-row flex-wrap list-none pl-0 mt-5"
        id="pills-tabJustify" role="tablist">
        <li className="nav-item flex-grow text-center my-2 md:mr-2" role="presentation">
          <a href="#pills-homeJustify" className="
              nav-link
              w-full
              block
              font-medium
              text-xs
              leading-tight
              uppercase
              rounded
              px-6
              py-3
              focus:outline-none focus:ring-0
              active
            " id="pills-home-tabJustify" data-bs-toggle="pill" data-bs-target="#pills-homeJustify" role="tab"
            aria-controls="pills-homeJustify" aria-selected="true" onClick={() => settokenstd("erc20")}>Create ERC20 Token</a>
        </li>
        <li className="nav-item flex-grow text-center my-2 md:mx-2" role="presentation">
          <a href="#pills-profileJustify" className="
              nav-link
              w-full
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
            aria-controls="pills-profileJustify" aria-selected="false" onClick={() => settokenstd("erc721")} >Create ERC721 Token</a>
        </li>
        <li className="nav-item flex-grow text-center my-2 md:mx-2" role="presentation">
          <a href="#pills-profileJustify" className="
              nav-link
              w-full
              block
              font-medium
              text-xs
              leading-tight
              uppercase
              rounded
              px-6
              py-3
              focus:outline-none focus:ring-0
            " id="pills-token-tabJustify" data-bs-toggle="pill" data-bs-target="#pills-tokenJustify" role="tab"
            aria-controls="pills-tokenJustify" aria-selected="false" onClick={() => settokenstd("erc1155")} >Create ERC1155 Token</a>
        </li>

      </ul>

      <div className="tab-content" id="pills-tabContentJustify">
        <div className="tab-pane fade show active" id="pills-homeJustify" role="tabpanel"
          aria-labelledby="pills-home-tabJustify">
          <Webform />
        </div>
        <div className="tab-pane fade" id="pills-profileJustify" role="tabpanel" aria-labelledby="pills-profile-tabJustify">
          <CreateERC tokenStd={tokenStd} />
        </div>
        <div className="tab-pane fade" id="pills-tokenJustify" role="tabpanel" aria-labelledby="pills-token-tabJustify">
          <CreateERC tokenStd={tokenStd} />
        </div>

      </div>


    </>
  )
}

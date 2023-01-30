import React, { useState } from 'react'
import UserTokenDetails from '../../components/UserTokenDetails/UserTokenDetails';
import UserNFTDetails from '../../components/UserNFTDetails/UserNFTDetails';

export default function Tokens() {
    const [tokenStd, settokenstd] = useState("ERC20");

    return (
        <>
            <p className='text-2xl font-medium'>Token Details</p>
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
                        aria-controls="pills-homeJustify" aria-selected="true" onClick={() => settokenstd("ERC20")}>Create ERC20 Token</a>
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
                        aria-controls="pills-profileJustify" aria-selected="false" onClick={() => settokenstd("ERC721")} >Create ERC721 Token</a>
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
                        aria-controls="pills-tokenJustify" aria-selected="false" onClick={() => settokenstd("ERC1155")} >Create ERC1155 Token</a>
                </li>

            </ul>

            <div className="tab-content" id="pills-tabContentJustify">
                <div className="tab-pane fade show active" id="pills-homeJustify" role="tabpanel"
                    aria-labelledby="pills-home-tabJustify">
                    <UserTokenDetails tokenStd={tokenStd} />
                </div>
                <div className="tab-pane fade" id="pills-profileJustify" role="tabpanel" aria-labelledby="pills-profile-tabJustify">
                    <UserNFTDetails tokenStd={tokenStd} />
                </div>
                <div className="tab-pane fade" id="pills-tokenJustify" role="tabpanel" aria-labelledby="pills-token-tabJustify">
                    <UserNFTDetails tokenStd={tokenStd} />
                </div>

            </div>


        </>
    )
}

import React from 'react';
import FeatherIcon from "feather-icons-react";

export default function NetworkModal({ selectedNetwork, currentNetwork, networkSelected }) {
    console.log("selectedNetwork", selectedNetwork, currentNetwork);

    const networkSelectedFromModal = (val) => {
        networkSelected(val)
    }

    return (
        <>
            <div className='popup'>
                <div className='popup_inner p-6 flex flex-col justify-center items-center'>

                    <div className='font-semibold text-xl flex flex-col justify-center items-center'>
                        <FeatherIcon icon="alert-circle" color="red" size="40px" />
                        <p>Warning</p>
                    </div>

                    <p className='pt-4'> {`Selected network doesn’t match the network from the wallet. Please switch to ${selectedNetwork}.`}</p>

                    <div className='flex flex-col justify-center items-center w-1/2'>
                        <button type='submit'
                            onClick={() => { networkSelectedFromModal(selectedNetwork) }}
                            className="flex-grow w-70 bg-orange-500 hover:bg-orange-700 text-white font-bold p-3 rounded mt-9" >
                            {`Switch to ${selectedNetwork} network`}
                        </button>
                        <button type='submit'
                            onClick={() => { networkSelectedFromModal(currentNetwork) }}
                            className="flex-grow w-70 text-orange font-bold py-2 px-2 rounded mt-9">
                            {`Switch to current network page`}
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
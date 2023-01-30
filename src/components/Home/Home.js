import React, { useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import Header from '../Shared/Header';
import Sidemenu from '../Shared/Sidemenu';
import FeatherIcon from "feather-icons-react";
const Home = ({ children }) => {
    const ref = useRef(null);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const [showMobileView, setShowMobileView] = useState(false);

    const menuSelected = () => {
        setShowMobileView(false)
    }

    return (
        <>
            {isMobile ?
                <>
                    <div className='bg-blue-50' ref={ref}>
                        <div className='bg-white p-6 flex flex-row items-center justify-between '>
                            <FeatherIcon className='' icon="menu" size="20px"
                                onClick={() => { setShowMobileView(true) }}
                            ></FeatherIcon>
                            <Header />
                        </div>
                        <div className='border bg-gray-500' />
                        <div className='bg-blue-50 p-8'>
                            {children}
                        </div>
                    </div>
                    {showMobileView ?
                        <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center z-100">
                            <div className="relative w-48 mr-auto my-2 ">
                                <div className="relative h-screen w-full ">
                                    <Sidemenu menuSelected={menuSelected} />
                                </div>
                            </div>
                        </div>
                        : null}
                </>
                :
                <div className="grid grid-cols-9 h-screen">
                    <div className="col-span-2">
                        <Sidemenu menuSelected={() => { console.log(""); }} />
                    </div>
                    <div className='col-span-7 bg-blue-50'>
                        <div className='bg-white p-6'>
                            <Header />
                        </div>
                        <div className='border bg-gray-500' />
                        <div className='bg-blue-50 p-8'>
                            {children}
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
// You can use useOnClickOutside hook.This hook allows you to detect clicks outside of a specified element.

// You have to import the followings

// Create a ref that we add to the element for which we want to detect outside clicks

// const ref = useRef();
// State for our modal

// const [showModal, setShowModal] = useState(false);
// Call hook passing in the ref and a function to call on outside click

// useOnClickOutside(ref, () => setShowModal(false));
// render here

// return (...);

//Hook


export default Home;
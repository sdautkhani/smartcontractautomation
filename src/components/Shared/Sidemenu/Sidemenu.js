import React from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Sidemenu.scss";
import FeatherIcon from "feather-icons-react";
import { NFTComponent } from '../../../assets/SvgComponent';

export default function Sidemenu({ menuSelected }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const splitLocation = pathname.split("/");

  return (
    <>

      <div className='side-menu h-full'>
        <nav className='flex flex-col items-center justify-center'>

          <div className='flex items-center px-2 md:px-4 py-5 cursor-pointer'
            onClick={() => {
              menuSelected();
              navigate('/dashboard');
            }}>
            <img src="./../../assets/icons/logo1.png"></img>
            <span className='md:px-3 font-semibold text-2xl text-orange tracking-tight '>
              Automator
            </span>
          </div>
          <div className='w-full border border-white-500' />
          <ul className='pt-4' onClick={() => {
            menuSelected();
          }}>
            <li>
              <NavLink
                to="/dashboard"
                className={
                  splitLocation[1] === "dashboard"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <FeatherIcon icon="grid" size="20px"></FeatherIcon>
                  <p className='px-2'>
                    Dashboard
                  </p>
                </div>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/create"
                className={
                  splitLocation[1] === "create"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <FeatherIcon icon="disc" size="20px"></FeatherIcon>
                  <p className=' px-2'>
                    Create Token
                  </p>
                </div>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/tokenList"
                className={
                  splitLocation[1] === "tokenList"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <FeatherIcon icon="list" size="20px"></FeatherIcon>
                  <p className=' px-2'>
                    Tokens
                  </p>
                </div>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/manageToken"
                className={
                  splitLocation[1] === "manageToken"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <FeatherIcon icon="settings" size="20px"></FeatherIcon>
                  <p className=' px-2'>
                    Manage Token
                  </p>
                </div>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/distributeToken"
                className={
                  splitLocation[1] === "distributeToken"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <FeatherIcon icon="slack" size="20px"></FeatherIcon>
                  <p className='px-2'>
                    Distribute Token
                  </p>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/createtokenSale"
                className={
                  splitLocation[1] === "createtokenSale"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <FeatherIcon icon="dollar-sign" size="20px"></FeatherIcon>
                  <p className='px-2'>
                    Create Token Sale
                  </p>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/managetokenSale"
                className={
                  splitLocation[1] === "managetokenSale"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <FeatherIcon icon="dollar-sign" size="20px"></FeatherIcon>
                  <p className='px-2'>
                    Manage Token Sale
                  </p>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tokenSale"
                className={
                  splitLocation[1] === "tokenSale"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <FeatherIcon icon="dollar-sign" size="20px"></FeatherIcon>
                  <p className='px-2'>
                    Token Sale
                  </p>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/distributeNFT"
                className={
                  splitLocation[1] === "distributeNFT"
                    ? "fas side-menu-active"
                    : "fas"
                }
              >
                <div className='flex flex-row'>
                  <NFTComponent color={splitLocation[1] === "distributeNFT" ? "#F99C1C" : "#ffffff"} />
                  <p className='px-2'>
                    Distribute NFT
                  </p>
                </div>
              </NavLink>
            </li>

          </ul>
        </nav>

      </div>

    </>
  )
}




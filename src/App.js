import { Component, useEffect } from 'react'
import { Route, Router, Routes, Switch } from 'react-router-dom'
import './app.styles.scss'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './Pages/Login'
import RegisterUser from './Pages/RegisterUser'
import Dashboard from './Pages/Dashboard'
import RequiredAuth from './components/RequiredAuth';
import ManageToken from './Pages/ManageToken';
import DistributeToken from './Pages/DistributeToken';
import DistributeNFT from './Pages/DistributeNFT';
import HomeScreen from './Pages/HomeScreen';
import CreateTokens from './Pages/CreateTokens'
import Tokens from './Pages/Tokens';
import CreateTokenSale from './Pages/CreateTokenSale';
import ManageTokenSale from './Pages/ManageTokenSale';
import TokenSale from './Pages/TokenSale';

import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';

function getLibrary(provider) {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      provider: '',
      web3: '',
      accounts: '',
      Balance: ''
    }
  }



  handleConnectWallet = async () => {

  };

  render() {
    return (
      <>
       <Web3ReactProvider getLibrary={getLibrary}>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<RegisterUser />} />
          <Route path='/' element={<HomeScreen />} />
          <Route path='/dashboard'
            element={
              <RequiredAuth>
                <Dashboard />
              </RequiredAuth>
            }
          />
          <Route path='/create'
            element={
              <RequiredAuth>
                <CreateTokens />
              </RequiredAuth>
            }
          />
          <Route path='/tokenList'
            element={
              <RequiredAuth>
                <Tokens />
              </RequiredAuth>
            }
          />
          <Route path='/manageToken'
            element={
              <RequiredAuth>
                <ManageToken />
              </RequiredAuth>
            }
          />
          <Route path='/distributeToken'
            element={
              <RequiredAuth>
                <DistributeToken />
              </RequiredAuth>
            }
          />
          <Route path='/distributeNFT'
            element={
              <RequiredAuth>
                <DistributeNFT />
              </RequiredAuth>
            }
          />
           <Route path='/createtokenSale'
            element={
              <RequiredAuth>
                <CreateTokenSale />
              </RequiredAuth>
            }
          />
           <Route path='/managetokenSale'
            element={
              <RequiredAuth>
                <ManageTokenSale />
              </RequiredAuth>
            }
          />
           <Route path='/tokenSale/:address/:chainId'
           loader={({ params }) => {
            params.address; // abc
            params.chainId; // 3
          }}
          action={({ params }) => {
            params.projectId; // abc
            params.taskId; // 3
          }}
            element={
            
               
                 <TokenSale />
              
            }
          />
          
        </Routes>
        
        <ToastContainer theme="colored" Transition="flip"></ToastContainer>
        </Web3ReactProvider>
      </>
    )
  }
}

export default App

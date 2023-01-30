import { Component } from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import './app.styles.scss'
import Web3 from 'web3'
import {ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Shared/Header'
import Sidemenu from './components/Shared/Sidemenu'
import TokenDetails from './Pages/TokenDetails'
import SubscriptionFee from './Pages/SubscriptionFee'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import UsersDetail from './Pages/UsersDetail'
import  RequiredAuth  from './components/RequiredAuth';


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      provider: '',
      web3: '',
      accounts: '',
    }
  }

  handleInit = () => {
    // const { ethereum } = window
    // console.log('Ethereum version : ', ethereum.networkVersion)
    // console.log(this.state)

    // if (ethereum && ethereum.isMetaMask) {
    //   const web3 = new Web3(
    //     Web3.givenProvider ||
    //       'https://rinkeby.infura.io/v3/b140d24d3a5744e0b9b98848003f07fe'
    //   )
    //   this.setState({
    //     provider: ethereum,
    //     web3: web3,
    //     accounts: ethereum.selectedAddress,
    //   })
    // } else {
    //   console.log('Metamask not installed')
    // }
  }

  componentDidMount() {
    this.handleInit()
  }

  handleConnectWallet = () => {
    // const { provider, web3 } = this.state
    // provider.request({ method: 'eth_requestAccounts' })
    // var accounts = web3.eth.accounts[0]
    // this.setState({
    //   accounts: accounts,
    // })
  }

  render() {
    return (
      //  <Provider>
      <>        <Routes>
        
        {/* <Route path='/login' element={<Login />} /> */}
          <Route path='/' element={<Login />} />
          <Route path='/tokenDetails/:userName' element={<RequiredAuth><TokenDetails /></RequiredAuth>} />
          <Route path='/subscriptionFee' element={<RequiredAuth><SubscriptionFee /></RequiredAuth>} />
          <Route path='/dashboard' element={<RequiredAuth><Dashboard /></RequiredAuth>} />
          <Route path='/user' element={<RequiredAuth><UsersDetail /></RequiredAuth>} />
          
          
        </Routes>
        <ToastContainer theme="colored" Transition="flip"></ToastContainer>
        </>

    )
  }
}

export default App

import React from "react";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWeb3React } from "@web3-react/core";
import { useMetaMask } from "metamask-react";
import MetaMaskOnboarding from '@metamask/onboarding';
import { connectors } from "./Connectors";
import styled,{keyframes} from "styled-components";
import { useTransactionStore } from "../../Store/TransactionStore";
import { explorerUrls } from "../../config";
// import Spinner from "../Spinner";

export default function SelectWalletModal({ closeModal }) {
  const [activatingConnector, setActivatingConnector] = React.useState();
// const [isActivating, setIsActivating] = useState(false)
  const { activate,connector,error,chainId } = useWeb3React();
  const onboarding = React.useRef();
  const { status } = useMetaMask();

  const transactionList = useTransactionStore((state) => state.Transaction);
  const resetTransaction = useTransactionStore((state) => state.resetTransaction)

  const setProvider = (type) => {
    window.localStorage.setItem("provider", type);
  };

  React.useEffect(() => {
    console.log('running')
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
      closeModal()
    }
  }, [activatingConnector, connector]);

  return (
    <>
      <div className="w-full md:w-3/5 fixed left-1/2 top-1/2 flex items-center justify-center" style={{top:'5%', transform: "translate(-50%, 1%)",zIndex:51,padding:10}}>
        {/* <div className="relative w-1/5 mx-auto my-2 h-4/5"> */}
          <div className=" flex flex-col w-full rounded-2xl shadow-lg outline-none focus:outline-none" style={{background:'#FFF',border:'1px solid gray',maxWidth:450}}>
            <div className="flex justify-between mt-4 mr-4">
              <h1 className="font-bold text-2xl pl-2"> Select Wallet</h1>
              <FontAwesomeIcon onClick={() => closeModal()} icon={faClose} className='w-6 h-6 cursor-pointer' />
            </div>
            <div className="border mt-2"></div>
            <div className='p-3 pb-0'>
              <div  className="flex justify-between flex-row flex-wrap">
                <WalletButton
                  // className="border border-slate-200 rounded-2xl px-2 py-1 shadow mb-2"
                  onClick={() => {
                    if (status === "unavailable") {
                      onboarding.current = new MetaMaskOnboarding();
                      onboarding.current.startOnboarding();
                      // closeModal();
                  }else{
                    setActivatingConnector(connectors.injected);
                    activate(connectors.injected);
                    setProvider("injected");
                    // closeModal();
                  }
                  }}
                >
                  <div className="flex flex-row items-center">
                    <div className="w-full">Metamask</div>
                    <img
                      src="../assets/icons/mm.png"
                      alt="Metamask Logo"
                      width={25}
                      height={25}
                    />
                  </div>
                </WalletButton>

                <WalletButton
                //  className="border border-slate-200 rounded-2xl px-2 py-1 shadow mb-2"
                  onClick={() => {
                    setActivatingConnector(connectors.walletConnect);
                    activate(connectors.walletConnect);
                    setProvider("walletConnect");
                    // closeModal();
                  }}
                >
                  <div className="flex flex-row items-center">
                    <div className="w-full">Wallet Connect</div>
                    <img
                      src="../assets/icons/wc.png"
                      alt="Wallet Connect Logo"
                      width={25}
                      height={25}
                      style={{borderRadius: '50%', background:'#fff'}}
                    />
                  </div>
                </WalletButton>

                <WalletButton
                //  className="border border-slate-200 rounded-2xl px-2 py-1 shadow mb-2"
                  onClick={() => {
                    setActivatingConnector(connectors.coinbaseWallet);
                    activate(connectors.coinbaseWallet);
                    setProvider("coinbaseWallet");
                    // closeModal();
                  }}
                >
                  <div className="flex flex-row items-center">
                    <div className="w-full">Coinbase Wallet</div>
                    <img
                      src="../assets/icons/cbw.png"
                      alt="Coinbase Wallet Logo"
                      width={25}
                      height={25}
                      style={{borderRadius: '50%'}}
                    />
                  </div>
                </WalletButton>
                <WalletButton
                //  className="border border-slate-200 rounded-2xl px-2 py-1 shadow mb-2"
                  onClick={() => {
                    setActivatingConnector(connectors.authereumWallet);
                    activate(connectors.authereumWallet);
                    setProvider("authereumWallet");
                    // closeModal();
                  }}
                >
                  <div className="flex flex-row items-center">
                    <div className="w-full">Authereum </div>
                    <img
                      src="../assets/icons/authereum.png"
                      alt="Coinbase Wallet Logo"
                      width={25}
                      height={25}
                      style={{borderRadius: '50%', background:'#fff'}}
                    />
                  </div>
                </WalletButton>
                <WalletButton
                //  className="border border-slate-200 rounded-2xl px-2 py-1 shadow mb-2"
                  onClick={() => {
                    setActivatingConnector(connectors.torus);
                    activate(connectors.torus);
                    setProvider("torus");
                    // closeModal();
                  }}
                >
                  <div className="flex flex-row items-center">
                    <div className="w-full">Torus </div>
                    <img
                      src="../assets/icons/torus.png"
                      alt=""
                      width={25}
                      height={25}
                      style={{borderRadius: '50%', background:'#fff'}}
                    />
                  </div>
                </WalletButton>
                <WalletButton
                //  className="border border-slate-200 rounded-2xl px-2 py-1 shadow mb-2"
                  onClick={() => {
                    setActivatingConnector(connectors.fortmatic);
                    activate(connectors.fortmatic);
                    setProvider("frame");
                    // closeModal();
                  }}
                >
                  <div className="flex flex-row items-center">
                    <div className="w-full">fortmatic </div>
                    <img
                      src="../assets/icons/fortmatic.png"
                      alt="Coinbase Wallet Logo"
                      width={25}
                      height={25}
                      style={{borderRadius: '50%'}}
                    />
                  </div>
                </WalletButton>
              </div>
            <div className="border-2 rounded-xl bg-transparent p-3 mb-4">
              <div className="flex justify-between pb-2">
                <div className="text-base font-medium">Recent Transactions</div>
                <ClearButton className="rounded-full" onClick={()=>resetTransaction()}>Clear all</ClearButton>
              </div>
              <hr/>
              <div style={{ maxHeight: 75, overflowY: 'auto' }}>
                {transactionList && transactionList.map((tnx) => {
                  return (
                    <div >
                      <div class="flex flex-col w-full py-1">
                        <div class="flex gap-1">
                          <a target="_blank" rel="noopener noreferrer" href={`${explorerUrls[chainId]}${tnx.tnxHash}`} class="flex items-center gap-2 text-zinc-700 no-underline hover:text-gray-50">
                            {tnx.status === 1 ? <div class="text-green">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#198754" aria-hidden="true" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </div>
                              :
                              <MySpinner />
                            }
                            <div className="text-xs font-bold flex gap-1 items-center text-slate-700 hover:text-slate-500 py-0.5 ">{tnx.method} -  {tnx.tnxHash.split(0,10)+"..."+tnx.tnxHash.split(-10)}</div>
                          </a>
                        </div>
                      </div>
                      <div className="border-b border-gray-400"></div>
                    </div>
                  )
                })
                }
                {!transactionList || !transactionList?.length ? 
              <div className="text-xs font-bold flex gap-1 items-center text-slate-700 hover:text-slate-500 py-0.5 ">Your transactions will appear here...</div>  
              :null}
              </div>
            </div>
            </div>
            {/* <div>
              {activatingConnector &&<>
                <div className="border mt-2"></div>
                <div className="flex items-center justify-center text-white"> Activating...</div>
              </>}
              {
                error && !connector &&<>
                 <div className="border mt-2"></div>
                <div className="flex items-center justify-center text-red-500"> {error.message}</div>
                </>
              }
            </div> */}

          
          </div>
        {/* </div> */}
      </div>
    </>

  );
}

const WalletButton = styled.button`
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 1px 1px 4px;
    color: #212529;
    padding: 10px;
    width: 48%;
    margin-bottom: 1rem;
    font-weight: 500;
    font-size: 14px;
    &:hover{
      border: 2px solid;
      padding: 8px;
    }
`
const ClearButton = styled.div`
    background: #ffd6d6;
    border-radius: 5px;
    color: #ff051d;
    padding: 4px 8px !important;
    font-size: 14px;
    &:hover{
      background: red;
      color: #FFF;
    }
}
`
const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);
  
  border-top: 2px solid grey;
  border-right: 2px solid grey;
  border-bottom: 2px solid grey;
  border-left: 4px solid black;

  background: transparent;

  width: 24px;
  height: 24px;
  border-radius: 50%;
`;
export const MySpinner = styled(Spinner)`
height:16px;
width:16px;
`
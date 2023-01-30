import { useEffect, useState } from "react";
import SelectWalletModal from "./Web3Modal";
import { useWeb3React } from "@web3-react/core";
import { networkParams } from "../../helpers/Networks";
import { connectors } from "./Connectors";
import { toHex, truncateAddress } from "./utils";
import { useWalletStore } from "../../Store";

export default function WalletConnect({ showAddressString, isDisconnectAllows = false, connectButtonText = 'Connect Wallet', }) {
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    library,
    chainId,
    account,
    activate,
    deactivate,
    active
  } = useWeb3React();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [network, setNetwork] = useState(undefined);
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();


  // const setWalletId = useWalletStore((state) => state.setWalletId);
  //     const resetWalletId = useWalletStore((state) => state.resetWalletId);

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[toHex(network)]]
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const signMessage = async () => {
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: [message, account]
      });
      setSignedMessage(message);
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };

  const verifyMessage = async () => {
    if (!library) return;
    try {
      const verify = await library.provider.request({
        method: "personal_ecRecover",
        params: [signedMessage, signature]
      });
      setVerified(verify === account.toLowerCase());
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    window.localStorage.setItem("provider", '');
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified('');
  };

  const disconnect = () => {
    refreshState();
    deactivate();
    // resetWalletId();
  };
// 
  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider && window.ethereum) {
      // alert(status);
      activate(connectors['injected']);
    }
  }, [account]);

  //   useEffect(() => {
  //     if (account) {
  //         setWalletId(account)
  //     } else  {
  //         resetWalletId();
  //     }
  // }, [account,active])

  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false)
  }


  return (
    <>

      <div className="flex justify-center items-center" h="100vh">
        <div>
          {!active ? (
            <button onClick={() => (setIsOpen(true))}>{connectButtonText}</button>
          ) : isDisconnectAllows ?
            <button onClick={disconnect}>{'Disconnect'}</button>

            : (
              <button onClick={() => { setIsOpen(!isOpen) }}>{connectButtonText ? connectButtonText : account?.slice(0, 4) + "..." + account?.slice(-4)}</button>
            )}
        </div>
        <div>{error ? error.message : null}</div>
      </div>
      {isOpen && <SelectWalletModal isOpen={isOpen} closeModal={onClose} />}
    </>
  );
}

import { AuthereumConnector } from "@web3-react/authereum-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { FrameConnector } from "@web3-react/frame-connector";
import { InjectedConnector } from "@web3-react/injected-connector";
import { PortisConnector } from "@web3-react/portis-connector";
import { TorusConnector } from "@web3-react/torus-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { RPC_URLS } from "../../helpers/Networks";

const injected = new InjectedConnector({
  supportedChainIds: [1,80001,137,3,4,42,97,56,43114,43113,5]
});

const walletconnect = new WalletConnectConnector({
 rpc:{

  137:RPC_URLS[137],
  80001: RPC_URLS[80001],
  80001: RPC_URLS[80001],
  3: RPC_URLS[3],
  4: RPC_URLS[4],
  1: RPC_URLS[1],
  42: RPC_URLS[42],
  5:RPC_URLS[5]

},
  bridge: `${process.env.BIRDGE_URL}`,
  qrcode: true
});

const walletlink = new WalletLinkConnector({
  url: `${process.env.INFURA_URL}${process.env.INFURA_KEY}`,
  appName: "Poly Automator",
  supportedChainIds:[1,80001,137,3,4,42,97,56,43114,43113,5]
});
export const authereum = new AuthereumConnector({ chainId: process.env.CHAIN_ID });
export const torus = new TorusConnector({ chainId: process.env.TORUS_CHAIN_ID });
export const portis = new PortisConnector({
  dAppId: `${process.env.DAPP_ID}`,
  networks: [1,100,80001,5]
});
export const fortmatic = new FortmaticConnector({
  apiKey: `${process.env.API_KEY}`,
  chainId: 1
});
export const frame = new FrameConnector({ supportedChainIds: [1] });
export const connectors = {
  injected: injected,
  walletConnect: walletconnect,
  coinbaseWallet: walletlink,
  authereumWallet: authereum,
  torus: torus,
  Portis: PortisConnector,
  fortmatic: fortmatic
};
import ReactDOM from 'react-dom'
import App from './App'
import './index.scss'
import { BrowserRouter } from 'react-router-dom'
import 'tw-elements';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
)

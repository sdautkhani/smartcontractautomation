import {useLocation } from 'react-router-dom';
import Home from '../Home';

export default function RequiredAuth({ children }) {
   
    return (
      
                <Home children={children} />
           
    )
}

import {toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function notify(msg, type) { 
    switch (type) {
        case 'success':
            toast.success(msg);
            break;
        case 'error':
              toast.error(msg, { position: toast.POSITION.TOP_RIGHT });
            break;
        case 'info':
             toast.info(msg, { position: toast.POSITION.TOP_RIGHT });
            break;
        case 'warning':
              toast.warning(msg, { position: toast.POSITION.TOP_RIGHT });
            break;
    }
  
    }
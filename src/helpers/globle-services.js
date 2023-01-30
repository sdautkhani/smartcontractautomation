
import axios from "axios";
//import {useNavigate } from "react-router-dom";

export function globalService(config) {
 // const navigate=useNavigate();
  return new Promise((resolve, reject) => {
    console.log(config);
    axios(config)
      .then((response) => {
        console.log(response);
        // if(response.data=="Unauthenticated request"){
        //   navigate("/");
        // }
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

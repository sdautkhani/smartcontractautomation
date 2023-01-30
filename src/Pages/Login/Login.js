import React, { useState,useEffect } from 'react';
import {Link,Outlet,useNavigate } from "react-router-dom";
import "./Login.scss";
import {toast} from 'react-toastify';


import{
    USER_BASE_URL,
    globalService,
    USER_LOGIN_URL,
    } from "../../helpers";

export default function Login() {
    const state = {
        username: "",
        password: ""
    };
    const navigate=useNavigate();
    const [formValues,setFormValue]=useState(state)
    const [submitted,setSubmitValue] = useState(false);
    const [formError,setFormError]=useState({})
    sessionStorage.clear();
    const handleChange=(e)=>{
        const {name,value}=e.target;
        setFormValue({...formValues,[name]:value});
    }

    const handleSubmit=(e)=>{
        e.preventDefault();
        setFormError(validate(formValues));
        setSubmitValue(true);
    }

    const validate=(values)=>{
        const error={};
        let eamil_regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
        if(values.username==""){
            error.username="User name Required!"
        }
        // else if(!eamil_regex.test(values.username)){
        //     error.username="Required valid Username!"
        // }
        if(values.password==""){
            error.password="User name Required!"
        }
        if(values.password==""){
            error.password="Password Required!"
        }
        return error;
    }
    useEffect(async()=>{
        if(Object.keys(formError).length==0 && submitted){
          
            var config = {
                method: "POST",
                url: `${USER_BASE_URL}/${USER_LOGIN_URL}`,
                data: formValues,
              };
              console.log(config);
              
              try {
               const resp = await globalService(config);
               console.log(resp);
               if(resp.token!=null && (resp.token!="")){
               // sessionStorage.setItem("user",resp);
               sessionStorage['user'] = JSON.stringify(resp);
               // console.log(sessionStorage.getItem("user"));
                   navigate("/dashboard");
             
               }else{
               
              toast.error(resp.msg)
               }
               
             
              } catch (err) {
                console.log(err);
              }
         
        }else  if(Object.keys(formError).length !=0 && submitted){
            alert(JSON.stringify(formError));
        }
        setSubmitValue(false);
    },[formError]);
   
    return (
        <>
        {/* <div className="w-full p-4 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700 mx-auto">    */}
        <div className="w-full my-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700 mx-auto">   
        <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">  Sign In</h2>         
            <form name="form" onSubmit={handleSubmit}>
           
                <div className="intro-x mt-8">
                <h6>User Name</h6>
                    <input
                        type="text"
                        className={`w-full intro-x login__input form-control py-3 px-4 border-gray-300 block ${submitted && formError.username!='' ? "input-error" : ""
                            }`}
                        placeholder="Email"
                        name="username"
                        value={formValues.username}
                        onChange={handleChange}

                    />
                </div>
                
                <div className="intro-x mt-8">
                <h6>Password</h6>
                    <input
                        type="password"
                        className={`w-full intro-x login__input form-control py-3 px-4 border-gray-300 block mt-4 ${submitted && formError.password!='' ? "input-error" : ""
                            }`}
                        placeholder="Password"
                        name="password"
                        value={formValues.password}
                        onChange={handleChange}

                    />
                    {submitted && formError.password && (
                        <div className="help-block">{formError.password}</div>
                    )}
                </div>
                <div className="intro-x flex text-gray-700 dark:text-gray-600 text-xs sm:text-sm mt-4">
                    <div className="flex items-center mr-auto">
                        <input
                            id="remember-me"
                            type="checkbox"
                            className="form-check-input border mr-2" />
                        <label
                            className="cursor-pointer select-none"
                            htmlFor="remember-me">
                            Remember me
                        </label>
                    </div>
                    <a href="#">Forgot Password?</a>
                </div>
                <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                    <button   type='submit'  className="w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-9">
                        Login
                    </button>
                    {/* <a href="#" >Sign Up?</a> */}
                    {/* <nav>
                        <Link to="register">Sign Up? </Link>
                      </nav> */}
                
                      <Outlet />
                </div>
            </form>
        </div>
 </>
    )
}




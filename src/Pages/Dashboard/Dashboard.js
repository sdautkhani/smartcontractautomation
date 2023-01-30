import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import "./Dashboard.scss";
//import { Sidemenu } from "../Sidemenu";

import {
  USER_BASE_URL,
  globalService,
  USER_LOGIN_URL,
} from "../../helpers";

export default function Dashboard() {
  const location = useLocation();
  const { pathname } = location;
  const splitLocation = pathname.split("/");
  console.log(sessionStorage.getItem("user"));

  return (
    <>
      <div className="main">
      </div>
    </>
  )
}




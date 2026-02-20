
import { Navigate } from "react-router-dom";
import React from "react";


const ProtectedRoute = ({children,endPoint,message})=>{
    const session_data=localStorage.getItem("session_data");
    

    if(session_data==null){
         window.alert("Unauthorized access not allowed:Re-Login please!!");
         return <Navigate to={endPoint+"?"+message}replace/>
        }
        
            return children;
        };


export default ProtectedRoute;
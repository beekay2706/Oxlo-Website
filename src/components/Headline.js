import React, { useEffect, useState } from 'react'
import Close from './Close'
import rocket from "../../public/images/rocket.svg";
import Image from 'next/image';

const Headline = () => {
  
  const [status, setStatus] = useState("");

  const updateStatus=()=>{
    setStatus("hide");
  };

  return (
    <div className={`headline ${status}`}>
        <p><Image src={rocket} alt="Rocket" /> 1500+ early access signups in our first week</p>
        <span onClick={updateStatus}><Close/></span>
    </div>
  )
}

export default Headline
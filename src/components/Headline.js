import React, { useState } from 'react'
import Close from './Close';
import Button from "@/components/Button";
import rocket from "../../public/images/rocket.svg";
import Image from 'next/image';

const Headline = () => {
  
  const [status, setStatus] = useState("");

  const updateStatus=()=>{
    setStatus("hide");
  };

  return (
    <div className={`headline ${status}`}>
        <p>Are you an AI builder, Join our OxBuild hackathon to showcase you skills</p>
        <Button
          title="Join Now"
          link="https://dorahacks.io/hackathon/oxloai/"
          size="btn-sm light"
        />
        <span onClick={updateStatus}><Close/></span>
    </div>
  )
}

export default Headline
import React from 'react'
import nofile from "../assets/iconofile.svg";


const  NoFilterData: React.FC =()=> {
  return (
    <div className='flex flex-col items-center justify-center'>
        <div className='flex flex-col items-center justify-center gap-5'>
            <img src={nofile} alt="No Available" className='w-[90px] h-[100px]'/>
            <p className='font-roboto text-[15px] font-bold leading-[28.13px] text-center'>To view and Download a Report <br/> Use the filters and hit the button VIEW to be able to download it!</p>
        </div>
    </div>
  )
}

export default NoFilterData
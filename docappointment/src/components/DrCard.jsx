


import React from "react";

export default function DrCard(){
    return (
        <>
       <div className="card bg-base-100 w-96 shadow-sm">
  <figure>
    <img
      src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
      alt="Shoes" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">
      {name}
      <div className="badge badge-secondary">{}</div>
    </h2>
    <p>{email/address/location}</p>
    <div className="card-actions justify-start">
      <div className="badge badge-outline">Book Now </div>
   
    </div>
  </div>
</div>
        </>
    )
}
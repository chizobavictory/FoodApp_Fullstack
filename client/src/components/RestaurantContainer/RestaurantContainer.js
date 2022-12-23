import React, { useEffect } from 'react'
import tableChair from "../../assets/tableChair.svg"
import search from "../../assets/search.svg"
import "./RestaurantContainer.css"
// import hamburger from "../../assets/hamburger.svg"
// import kfc from "../../assets/kfc.png"
// import pizza from "../../assets/pizza-hut.svg"
import { useParams } from 'react-router'
import { useAuth } from '../../context/authcontext'

const RestaurantContainer = () => {
    const { GetAllVendorsFood,
        getVendorFood} = useAuth();
    let {vendorId} = useParams()
    console.log(getVendorFood)

    useEffect(()=>{
        GetAllVendorsFood(vendorId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
  return (
    <div>
        <div className='rest-header'>
            <h3>Restaurants<span><img src={tableChair} alt="" /></span></h3>
            <form className='rest-form'>
                <input type="text" placeholder="Search"  />
                <img src={search} alt="" />
            </form>
        </div>
        {
           getVendorFood.map((elem)=>(
            <section className="restaurant-card" key={elem.id}>
            <img src={elem.image} alt="" />
            <div>
                <h3>{elem.name}</h3>
                <p>
               {elem.description}
                </p>
            </div>
        </section>
           )) 
        }

    </div>
  )
}

export default RestaurantContainer
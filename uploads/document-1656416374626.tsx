import React from "react";
import StarRatings from "react-star-ratings";
import {Link} from 'react-router-dom'
import "../../CSS/Client/ProgressCardClient.css";

function ClientCardArchived(props:any){
console.log(props)
    return(<>
       <div className="card card-color">
                <div className="card-upper">
                    <div className="col-4">
                        <img
                            src={require("../../images/card-men.svg").default}
                            className="card-img-top"
                            alt="..."
                        />
                    </div>
                    <div className="col-7 ">
                    <p>{props.data.clientCompanyName}</p>
                  <p></p>
                        <div >  <p>Motivation: 
                            <StarRatings
                                              rating={props.data.clientMotivation}
                                starRatedColor="#ffc107"
                                // changeRating={}
                                numberOfStars={props.data.clientMotivation}
                                starDimension={'11px'}
                                starSpacing={'0px'}
                                name='rating'
                            />
                        </p>
                        </div>
                        <div >  <p>Importance : 
                            <StarRatings
                                rating={props.data.clientImportance}
                                starRatedColor="#ffc107"
                                // changeRating={}
                                numberOfStars={props.data.clientImportance}
                                starDimension={'9px'}
                                starSpacing={'0px'}
                                name='rating'
                            />
                        </p>
                        </div>
                        <div ><p>Num of position : {props.data.numberOfPosts}</p></div>
                        <button className="Archive001">Archived</button>

                    </div>
                </div>

                <div className="card-body">
                <p>Secteur : {props.data.clientActivitySector}</p>
                    <p>Job : {props.data.clientJob}</p>
                    <p>Langues : {props.data.clientLanguages} </p>
                    <p>Phone Number : {props.data.clientPhone} </p>

                    <p className="blue">Recruiting :From {props.data.jobStartDate}To {props.data.jobEndDate} </p>
                    <p>Estimated CA : {props.data.jobTotalBudget} </p>
                   
                    <p>Salary by person : {props.data.netSalary} </p>
                    <p>Client Phone : {props.data.clientPhone} </p>
                    <p>Contact Name : {props.data.clientReferenceName}</p>
                    <p> Contact phone : {props.data.clientPhone} </p>
                    <span style={{fontSize:"13px"}}>
                        <input type="checkbox" />
                        Permise
                    </span>
                  
                    <div className="padding">
                    <div className="ads-box-red">
                    <p>Ads Spent on this client: {props.data.jobTotalBudget}  </p>
                    <p>Reason archived : {props.data.clientArchived.reason} 
                         </p>
                    </div>
                    <div className="col-12">
                        <div className="row">
   
                    <div className="col-6 text-center">
                 <Link to="#" className="btn btn-card">
                        See Full Profile
                    </Link>
                 </div>
                   <div className="col-6 text-center">
                   <Link to="#" className="btn btn-cardRightOne">
                        Edit Profile
                    </Link>
                   </div>
                  
                    </div>
                    </div>
                    </div>
                </div>
            </div>
    </>)
}
export default ClientCardArchived;
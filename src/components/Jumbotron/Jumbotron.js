import React from "react";

const Jumbotron = props =>(
        <div className="jumbotron" id="jumboHome">
            <div className="container-fluid" id="displayContainer">
	            <h1 id="heading"><img id="logoHome" src="images/redcheck.png" alt="" height="200" width="150"/>MedMate</h1> 
	            <h3 id="subheading">We remember so you don't have to!</h3>
	            <div className="panel-body" id="btnPanel">
		            <a className = "btn btn-info btn-home" href="/login">Login</a>
		            <a className = "btn btn-info btn-home" href="/users">Sign Up</a>
		        </div>
			</div>
		</div>
);

export default Jumbotron;

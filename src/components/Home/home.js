import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


function Home() {

  
  return (

    <div className="App">
       <div className="container mt-5">
      <div className="jumbotron">
        <h1 className="display-4">Welcome to the Sports Store</h1>
        <p className="lead">Your one-stop shop for sports equipment and gear.</p>
        <hr className="my-4" />
   
      
      </div>

      <div className="row">
        {/* Add sports-related content here */}
        <div className="col-md-5">
          <div className="card mb-2">
            <img src="https://images.pexels.com/photos/10923070/pexels-photo-10923070.jpeg?auto=compress&cs=tinysrgb&w=400" />
            <div className="card-body">
              <h5 className="card-title"> Shoses</h5>
              <p className="card-text">Explore our products in this category.</p>
              <a href="#" className="btn btn-primary">
                Learn More
              </a>
            </div>
          </div>
        </div>
        
        <div className="col-md-5">
          <div className="card mb-2">
            <img src="https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400" className="card-img-top" alt="Sports 2" />
            <div className="card-body">
              <h5 className="card-title">Clothes</h5>
              <p className="card-text">Discover our products in this category.</p>
              <a href="#" className="btn btn-primary">
                Learn More
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card mb-2">
            <img src="https://images.pexels.com/photos/6740821/pexels-photo-6740821.jpeg?auto=compress&cs=tinysrgb&w=400" className="card-img-top" alt="Sports 2" />
            <div className="card-body">
              <h5 className="card-title">Sports Tools</h5>
              <p className="card-text">Discover our products in this category.</p>
              <a href="#" className="btn btn-primary">
                Learn More
              </a>
            </div>
          </div>
        </div><div className="col-md-6">
          <div className="card mb-4">
            <img src="sports-image2.jpg" className="card-img-top" alt="Sports 2" />
            <div className="card-body">
              <h5 className="card-title">Sports Category 2</h5>
              <p className="card-text">Discover our products in this category.</p>
              <a href="#" className="btn btn-primary">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div> 
     
    
    </div>
  );
}

export default Home;
<div></div>
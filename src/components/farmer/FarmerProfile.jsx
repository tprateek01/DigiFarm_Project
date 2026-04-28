import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/farmer/farmer.css';
import { userApiService } from '../../api/userApi';

const FarmerProfile = () => {
  const [farmer, setFarmer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPhoto, setEditPhoto] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Ranchi", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar",
    "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Howrah", "Gwalior", "Jabalpur",
    "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad"
  ];

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session_data"));
    if (!session || session.role !== "farmer") {
      alert("Unauthorized access. Please log in as a farmer.");
      navigate("/login");
      return;
    }

    const fullProfile = {
      id: session.id || "",
      name: session.full_name || session.name || "",
      email: session.email || "",
      role: session.role || "farmer",
      company: session.company_type || session.companyName || "",
      mobile: session.mobile || session.phone || "",
      photo: session.profileImage || "https://via.placeholder.com/100?text=Farmer",
      location: session.location || "",
      land_area: session.land_area || 0,
      aadhar_no: session.aadhar_no || ""
    };

    setFarmer(fullProfile);

    userApiService.getFarmerProfile(session.id, (data) => {
      if(data) {
        setFarmer({
          ...fullProfile,
          ...data,
          name: data.full_name || data.name || fullProfile.name,
          company: data.company_type || data.companyType || data.companyName || fullProfile.company,
          mobile: data.mobile || data.phone || fullProfile.mobile,
          photo: data.profileImage || fullProfile.photo,
          location: data.location || fullProfile.location || "N/A", // Ensure "N/A" if null
          land_area: data.land_area || fullProfile.land_area || 0, // Ensure 0 if null
          aadhar_no: data.aadhar_no || fullProfile.aadhar_no || "N/A" // Ensure "N/A" if null
        });
      }
    });

  }, [navigate]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setEditPhoto(farmer.photo);
    setLocationInput(farmer.location || "");
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);

    if (value.trim().length > 0) {
      const filtered = indianCities.filter(city => 
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setCitySuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCity = (city) => {
    setLocationInput(city);
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const updatedData = {
      full_name: e.target.inputName.value,
      mobile: e.target.inputPhone.value,
      location: locationInput,
      profileImage: editPhoto,
      land_area: parseFloat(e.target.inputLand.value) || 0,
      aadhar_no: e.target.inputAadhar.value
    };

    try {
      const res = await userApiService.patchUser(farmer.id, updatedData);
      
      const session = JSON.parse(localStorage.getItem("session_data"));
      const newSession = {
        ...session,
        name: res.full_name,
        mobile: res.mobile,
        location: res.location,
        profileImage: res.profileImage,
        land_area: res.land_area,
        aadhar_no: res.aadhar_no
      };
      localStorage.setItem("session_data", JSON.stringify(newSession));

      setFarmer({
        ...farmer,
        name: res.full_name,
        mobile: res.mobile,
        location: res.location,
        photo: res.profileImage,
        land_area: res.land_area,
        aadhar_no: res.aadhar_no
      });
      setIsEditing(false);
      alert("Profile updated!");
    } catch(err) {
      alert("Failed to save to backend API");
    }
  };

  if (!farmer) return <p>Loading farmer profile...</p>;

  return (
    <div className="farmer-profile-container">
      <div className="top">
        <h1>Farmer Profile</h1>
        <div>
          <Link to="/farmer/dashboard" className="btn-back">Back to Dashboard</Link>
        </div>
      </div>

      <div className="profile">
        <img id="farmerPhoto" src={farmer.photo} alt="Farmer" />
        <div>
          <h2 id="fName">{farmer.name}</h2>
          <p>ID: <span id="fId">{farmer.id}</span></p>
          <p>Email: <span id="fEmail">{farmer.email}</span></p>
          <p>Phone: <span id="fPhone">{farmer.mobile}</span></p>
          <p>Aadhar: <span>{farmer.aadhar_no || "N/A"}</span></p>
          <p>Location: <span>{farmer.location || "N/A"}</span></p>
          <p>Land Area: <span>{farmer.land_area || 0} Acres</span></p>
          <p>Earnings: <span>₹{farmer.earnings || 0}</span></p>
          <button onClick={toggleEdit}>Edit Profile</button>
        </div>
      </div>

      {isEditing && (
        <div className="section edit-section">
          <h3 className="heading">Edit Profile</h3>
          <form className="edit-form" onSubmit={saveProfile}>
            <label>Full name</label>
            <input id="inputName" defaultValue={farmer.name} />
            <label>Phone</label>
            <input id="inputPhone" defaultValue={farmer.mobile} />
            <label>Aadhar Number</label>
            <input id="inputAadhar" defaultValue={farmer.aadhar_no} />
            <label>Land Area (Acres)</label>
            <input id="inputLand" type="number" step="0.1" defaultValue={farmer.land_area} />
            
            <div className="form-group-location" style={{position: 'relative', display: 'flex', flexDirection: 'column'}}>
              <label>Location</label>
              <input 
                id="inputLocation" 
                value={locationInput} 
                onChange={handleLocationChange} 
                autoComplete="off" 
                placeholder="Search City..."
              />
              {showSuggestions && citySuggestions.length > 0 && (
                <ul className="city-suggestions-profile" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, 
                  background: 'white', border: '1px solid #ccc', zIndex: 10,
                  listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto'
                }}>
                  {citySuggestions.map((city, idx) => (
                    <li key={idx} onClick={() => selectCity(city)} style={{padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee'}}>
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label style={{marginTop: '10px'}}>Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {editPhoto && <img src={editPhoto} alt="Preview" style={{width: '50px', height: '50px', borderRadius: '50%', marginTop: '10px'}} />}
            <button type="submit" className="btn-back" style={{display: 'block', marginTop: '15px'}}>Save</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FarmerProfile;

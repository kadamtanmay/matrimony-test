import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { updateUser } from '../../redux/actions';
import axios from 'axios';

const Profile = () => {
  const currentUser = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { userName } = useParams();
  const location = useLocation();
  
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileUser, setProfileUser] = useState(null);

  // Pending request and connection states
  const [isConnected, setIsConnected] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('=== DEBUG INFO ===');
    console.log('Current User:', currentUser);
    console.log('URL Params - userName:', userName);
    console.log('Location state:', location.state);
    console.log('Location pathname:', location.pathname);
    console.log('Is own profile:', isOwnProfile);
    console.log('Profile user:', profileUser);
    console.log('=================');
  }, [currentUser, userName, location, isOwnProfile, profileUser]);

  // Check if this is own profile or viewing another user's profile
  useEffect(() => {
    console.log('Profile detection check:', {
      pathname: location.pathname,
      userName: userName,
      currentUserFirstName: currentUser?.firstName
    });

    if (location.pathname.includes('view-profile')) {
      console.log('Detected view-profile URL - setting as other user');
      setIsOwnProfile(false);

      if (location.state?.match) {
        console.log('Using match data from location state');
        setProfileUser(location.state.match);
        setFormData(location.state.match);
      } else {
        console.log('Creating temporary profile user from URL');
        const nameFromUrl = decodeURIComponent(userName || '');
        const nameParts = nameFromUrl.split(' ');
        const tempProfileUser = {
          id: 999, // temporary ID
          firstName: nameParts[0] || nameFromUrl,
          lastName: nameParts.slice(1).join(' ') || '',
          email: 'demo1@matrimoni.com',
          phone: '09172143507',
          dateOfBirth: '2025-07-01',
          maritalStatus: 'SINGLE',
          gender: 'MALE',
          religion: 'h',
          address: 'Not Available',
          annualIncome: 'Not Available',
          caste: 'Not Available',
          motherTongue: 'Not Available',
          education: 'Not Available',
          location: 'Not Available',
          hobbies: 'Not Available',
          profession: 'Not Available',
          bio: 'Bio not available'
        };

        setProfileUser(tempProfileUser);
        setFormData(tempProfileUser);
      }
    } else {
      console.log('Not a view-profile URL - setting as own profile');
      setIsOwnProfile(true);
      setProfileUser(currentUser);
      setFormData({ ...currentUser });
    }
  }, [userName, currentUser, location.pathname, location.state]);

  // ✅ Separate useEffect for recording profile views
  useEffect(() => {
    const recordProfileView = async () => {
      if (!isOwnProfile && profileUser && currentUser && profileUser.id !== 999) {
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `http://localhost:8080/user/profile/view/${profileUser.id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Profile view recorded for user:', profileUser.firstName);
        } catch (error) {
          console.error('Failed to record profile view:', error);
        }
      }
    };

    if (profileUser && currentUser) {
      recordProfileView();
    }
  }, [isOwnProfile, profileUser, currentUser]);

  // Fetch profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const userId = isOwnProfile ? currentUser.id : profileUser?.id;
        if (!userId || userId === 999) return;

        const response = await axios.get(`http://localhost:8080/profile-picture`, {
          params: { userId: userId }
        });
        if (response.data) {
          setImageUrl(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile picture");
      }
    };

    if (profileUser) {
      fetchProfilePicture();
    }
  }, [isOwnProfile, currentUser?.id, profileUser]);

  // Check request/connection status
  useEffect(() => {
    const checkStatus = async () => {
      if (isOwnProfile || !profileUser || !currentUser || profileUser.id === 999) {
        return;
      }

      try {
        const token = localStorage.getItem('token');

        console.log('Checking connection between:', currentUser.id, 'and', profileUser.id);

        const connectedResp = await axios.get('http://localhost:8080/pending-requests/is-connected', {
          params: { userId1: currentUser.id, userId2: profileUser.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Connected response:', connectedResp.data);
        setIsConnected(connectedResp.data.connected);

        const sentResp = await axios.get('http://localhost:8080/pending-requests/has-sent', {
          params: { senderId: currentUser.id, receiverId: profileUser.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Request sent response:', sentResp.data);
        setRequestSent(sentResp.data.hasSent);

      } catch (error) {
        console.error('Error checking status:', error);
        setIsConnected(false);
        setRequestSent(false);
      }
    };

    checkStatus();
  }, [isOwnProfile, currentUser, profileUser]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("userId", currentUser.id);
    try {
      await axios.post("http://localhost:8080/profile-picture/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(URL.createObjectURL(file));
    } catch (error) {
      console.error("Failed to upload image");
    }
  };

  const handleSaveClick = () => {
    dispatch(updateUser(formData));
    setIsEditing(false);
  };

  const handleSendRequest = async () => {
    if (profileUser.id === 999) {
      alert('Cannot send request - need real user ID');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/pending-requests/send', null, {
        params: { senderId: currentUser.id, receiverId: profileUser.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequestSent(true);
      alert('Request sent successfully');
    } catch (error) {
      console.error('Failed to send request:', error);
      alert('Failed to send request');
    }
  };

  const handleSendMessage = () => {
    window.location.href = `/messages/${profileUser.id}`;
  };

  return (
    <Layout>
      <div className="container d-flex justify-content-center align-items-center mt-0" style={{ minHeight: "100vh", overflowY: "auto" }}>
        <div className="card shadow-lg p-3" style={{ width: '28rem', maxHeight: "80vh", overflowY: "auto" }}>
          <div className="text-center">
            <img
              src={imageUrl || "https://i.pinimg.com/736x/7f/e7/cb/7fe7cb4ed3b692b581957a95f0f9774a.jpg"}
              className="card-img-top rounded-circle mx-auto mt-3"
              alt="Profile"
              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
            {/* Only show upload for own profile */}
            {isOwnProfile && (
              <>
                <input type="file" onChange={handleFileChange} accept="image/*" className="form-control mt-2 w-75 mx-auto" />
                <button onClick={handleUpload} className="btn btn-primary mt-2">Upload</button>
              </>
            )}
          </div>
          <div className="card-body text-center">
            <h3 className="card-title mb-3">
              {formData.firstName || "Not available"} {formData.lastName || ""}
            </h3>
            <p className="text-muted">{formData.bio || "Bio not available"}</p>

            <div className="row text-start">
              <div className="col-6">
                <p><strong>Address:</strong> {formData.address || "Not Available"}</p>
                <p><strong>Date of Birth:</strong> {formData.dateOfBirth || "Not Available"}</p>
                <p><strong>Email:</strong> {formData.email || "Not Available"}</p>
                <p><strong>Phone:</strong> {formData.phone || "Not Available"}</p>
                <p><strong>Religion:</strong> {formData.religion || "Not Available"}</p>
                <p><strong>Location:</strong> {formData.location || "Not Available"}</p>
              </div>
              <div className="col-6">
                <p><strong>Annual Income:</strong> {formData.annualIncome || "Not Available"}</p>
                <p><strong>Caste:</strong> {formData.caste || "Not Available"}</p>
                <p><strong>Marital Status:</strong> {formData.maritalStatus || "Not Available"}</p>
                <p><strong>Mother Tongue:</strong> {formData.motherTongue || "Not Available"}</p>
                <p><strong>Education:</strong> {formData.education || "Not Available"}</p>
                <p><strong>Gender:</strong> {formData.gender || "Not Available"}</p>
                <p><strong>Hobbies:</strong> {formData.hobbies || "Not Available"}</p>
                <p><strong>Profession:</strong> {formData.profession || "Not Available"}</p>
              </div>
            </div>

            {/* Only show edit button for own profile */}
            {isOwnProfile && (
              <button className="btn btn-primary mt-3" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Only for other users' profiles */}
      {!isOwnProfile && (
        <div className="container d-flex justify-content-center mt-3 gap-2">
          {isConnected ? (
            <button className="btn btn-primary" onClick={handleSendMessage}>
              Send Message
            </button>
          ) : requestSent ? (
            <button className="btn btn-secondary" disabled>
              Request Sent
            </button>
          ) : (
            <button className="btn btn-warning" onClick={handleSendRequest}>
              Send Request
            </button>
          )}
          <button className="btn btn-danger">Report Profile</button>
        </div>
      )}

      {/* Edit Modal - Only for own profile */}
      {isEditing && isOwnProfile && (
        <div className="modal fade show d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit Profile</h5>
                <button type="button" className="btn-close" onClick={() => setIsEditing(false)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <form>
                  {Object.keys(formData).filter(key => key !== 'id' && key !== 'password').map((key) => (
                    <div className="mb-3" key={key}>
                      <label className="form-label">{key.replace(/\_/g, ' ')}</label>
                      <input
                        type="text"
                        className="form-control"
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveClick}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profile;

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
          id: 999, // temporary ID - you'll need real ID for API calls
          firstName: nameParts[0] || nameFromUrl,
          lastName: nameParts.slice(1).join(' ') || '',
          email: 'demo1@matrimoni.com', // example email
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
  }, [isOwnProfile, currentUser.id, profileUser]);

  // Check request/connection status for other users' profiles
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

  // Track profile views at top-level useEffect
  useEffect(() => {
    const recordProfileView = async () => {
      if (!isOwnProfile && profileUser && currentUser && profileUser.id !== 999) {
        try {
          const token = localStorage.getItem('token');
          await axios.post(`http://localhost:8080/user/profile/view/${profileUser.id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
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

  // Handlers for form input, file change, upload, save, send request, and send message (same as your original code)
  // ... [Keep the handler functions unchanged] ...

  return (
    <Layout>
      {/* ... your existing JSX code unchanged ... */}
    </Layout>
  );
};

export default Profile;

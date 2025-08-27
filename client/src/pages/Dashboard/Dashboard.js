import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import axios from 'axios';
import { fetchMatches, fetchDashboardStats } from '../../redux/actions';

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  const matches = useSelector((state) => state.matches);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const dashboardStats = useSelector((state) => state.dashboardStats);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Re-add this state for profile images
  const [profileImages, setProfileImages] = useState({});

  // Filtered matches list
  const [filteredMatches, setFilteredMatches] = useState([]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMatches(user.id));
      dispatch(fetchDashboardStats(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    setFilteredMatches(matches);
  }, [matches]);

  useEffect(() => {
    const fetchProfileImages = async () => {
      const newImages = {};
      for (const match of matches) {
        try {
          const res = await axios.get(
            'http://localhost:8080/profile-picture',
            { params: { userId: match.id } }
          );
          newImages[match.id] = res.data;
        } catch {
          newImages[match.id] =
            'https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg';
        }
      }
      setProfileImages(newImages);
    };
    if (matches.length > 0) fetchProfileImages();
  }, [matches]);

  if (!user) return <Navigate to="/login" />;

  const stats = [
    { label: 'Total Matches', value: dashboardStats.totalMatches || 0 },
    { label: 'New Messages', value: dashboardStats.newMessages || 0 },
    { label: 'Pending Requests', value: dashboardStats.pendingRequests || 0 },
    { label: 'Profile Views', value: dashboardStats.profileViews || 0 },
  ];

  const actions = [
    { label: 'View Matches', icon: 'fa-heart', color: 'text-danger', path: '/matches' },
    { label: 'Messages', icon: 'fa-envelope', color: 'text-primary', path: '/message' },
    { label: 'Settings', icon: 'fa-cog', color: 'text-success', path: '/settings' },
    { label: 'Profile', icon: 'fa-user', color: 'text-warning', path: '/profile' },
  ];

  const notifications = [
    { message: 'You have a new match request!', time: '5 mins ago' },
    { message: 'Anushka viewed your profile', time: '30 mins ago' },
    { message: 'Your profile was updated successfully', time: '1 hour ago' },
  ];

  const profileCompletion = 85;
  const topMatches = filteredMatches.slice(0, 3);

  return (
    <Layout>
      <div className="container-fluid p-4">
        <h1>Welcome, {user.firstName}</h1>
        <p>{user.bio}</p>

        <div className="mt-4">
          <h4>Profile Completion</h4>
          <div className="progress" style={{ height: '25px' }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${profileCompletion}%` }}
            >
              {profileCompletion}%
            </div>
          </div>
        </div>

        <div className="row g-4 mt-5">
          {stats.map((stat, idx) => (
            <div className="col-lg-3 col-md-6 col-sm-12" key={idx}>
              <div className="card shadow-lg border-0 h-100">
                <div className="card-body text-center">
                  <h3 className="mb-2">{stat.value}</h3>
                  <p className="text-muted">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mt-5 justify-content-center">
          {actions.map((action, idx) => (
            <div className="col-md-3 col-sm-6" key={idx}>
              <Link to={action.path} className="text-decoration-none">
                <div className="card text-center shadow-lg border-0 h-100">
                  <div className={`card-body ${action.color}`}>
                    <i className={`fa ${action.icon} fa-3x mb-3`} />
                    <h5>{action.label}</h5>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h4>Recent Notifications</h4>
          <ul className="list-group">
            {notifications.map((note, idx) => (
              <li
                className="list-group-item d-flex justify-content-between align-items-center"
                key={idx}
              >
                {note.message}
                <span className="badge bg-primary rounded-pill">{note.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <h4>Top Matches</h4>
          <div className="row g-4">
            {loading ? (
              <p>Loading matches...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : topMatches.length > 0 ? (
              topMatches.map((match, idx) => (
                <div className="col-lg-4 col-md-6 col-sm-12" key={idx}>
                  <div className="card shadow-lg border-0 h-100">
                    <div className="card-body text-center">
                      <img
                        src={
                          profileImages[match.id] ||
                          'https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg'
                        }
                        className="card-img-top rounded-circle mx-auto mb-3"
                        alt={match.firstName}
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                        }}
                      />
                      <h3 className="card-title mb-2">{match.firstName}</h3>
                      <p className="text-muted">Profession: {match.profession}</p>
                      <p className="text-muted">Marital Status: {match.maritalStatus}</p>
                      <p className="text-muted">Date of Birth: {match.dateOfBirth}</p>
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(`/view-profile/${match.firstName}`, { state: { match } })
                        }
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No matches found.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

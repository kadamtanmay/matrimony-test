import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { setUser } from '../../redux/actions';
import axios from 'axios';

const Layout = ({ children }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  // ✅ RESTORE USER FROM TOKEN IF MISSING
  useEffect(() => {
    const restoreUserFromToken = async () => {
      if (!user && token) {
        try {
          console.log('User state missing but token exists, restoring user...');
          const response = await axios.get('http://localhost:8080/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('User restored from token:', response.data);
          dispatch(setUser(response.data));
        } catch (error) {
          console.error('Failed to restore user from token:', error);
          // Token might be invalid, remove it
          localStorage.removeItem('token');
        }
      }
    };

    restoreUserFromToken();
  }, [user, token, dispatch]);

  // ✅ ONLY REDIRECT IF NO USER AND NO TOKEN
  if (!user && !token) {
    console.log('No user and no token, redirecting to login');
    return <Navigate to="/login" />;
  }

  // ✅ SHOW LOADING WHILE RESTORING USER
  if (!user && token) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.5
  };

  return (
    <div
      className="layout-container"
      style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        height: '100vh'
      }}
    >
      <div className="sidebar-container bg-light p-3 shadow" style={{ height: '100vh' }}>
        <Sidebar />
      </div>

      <div className="content-container" style={{ overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
  key={children?.key || 'page'}
  initial="initial"
  animate="in"
  exit="out"
  variants={pageVariants}
  transition={pageTransition}
>
  {children}
</motion.div>

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;

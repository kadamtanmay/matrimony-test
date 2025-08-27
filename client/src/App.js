import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Matches from './pages/Matches/Matches';
import Dashboard from './pages/Dashboard/Dashboard';
import Settings from './pages/Settings/Settings';
import { DarkModeProvider } from './components/Context/DarkModeContext';
import Message from './pages/Mesage/Message';
import MessageScreen from './pages/MessageScreen/MessageScreen';
import ViewProfile from './pages/ViewProfile/ViewProfile';
import SelectPreferences from './pages/SelectPreferences/SelectPreferences'; // Adjust this based on the actual relative path
import 'bootstrap/dist/css/bootstrap.min.css';
import Subscription from './pages/Subscription/Subscription';








const App = () => {
  return (
    <DarkModeProvider>

    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/message" element={<Message />} />
        <Route path="/messages/:id" element={<MessageScreen />} />
        <Route path="/view-profile/:name" element={<ViewProfile />} />
        
        <Route path="/SelectPreferences" element={<SelectPreferences />} />

        <Route path="/subscription" element={<Subscription/>} />



      </Routes>
      <Footer />
    </Router>
    </DarkModeProvider>
  );
};

export default App;

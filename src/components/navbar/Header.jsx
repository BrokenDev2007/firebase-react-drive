import { HomeTwoTone, EditTwoTone, CheckCircleTwoTone, LogoutOutlined } from '@ant-design/icons';
import { Menu, Button } from 'antd';
import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

const Header = () => {
  const [current, setCurrent] = useState('h');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  const onClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <>
      <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal">
        <Menu.Item key="h" icon={<HomeTwoTone />}>
          <Link to="/home">Home</Link>
        </Menu.Item>
        
        {isAuthenticated ? (
          <>
            <Menu.Item key="l" icon={<LogoutOutlined />} style={{ marginLeft: 'auto' }}>
              <Button onClick={handleSignOut}>Logout</Button>
            </Menu.Item>
          </>
        ) : (
          <>
            
            <Menu.Item key="l" icon={<CheckCircleTwoTone />}>
              <Link to="/login">Login</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
      <Outlet />
    </>
  );
};

export default Header;

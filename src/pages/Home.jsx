import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Spin, message, Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase'; // Ensure the correct path
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import UploadButton from '../components/uploadButton'; // Adjust the path as necessary
import FileLoader from '../components/fileLoader'; // Adjust the path as necessary

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
        message.error('User is not authenticated.');
      }
      setLoading(false); // Set loading to false once authentication is checked
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const hideDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <Spin spinning={loading} size="large">
      <Layout style={{ minHeight: '100vh', backgroundColor: '#1f1f1f' }}>
        <Sider
          width={200}
          style={{ background: '#2c2c2c', overflow: 'auto', display: 'none' }}
          breakpoint="lg"
          collapsedWidth="0"
          trigger={null}
          collapsible
          collapsed
        >
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Title level={3} style={{ color: '#fff' }}>BrokenDev_ Storage</Title>
          </div>
          <div style={{ padding: '0 24px' }}>
            <UploadButton />
            <Button type="danger" icon={<LogoutOutlined />} block onClick={handleLogout} style={{ backgroundColor: 'red', color: '#fff', marginTop: '16px' }}>
              Logout
            </Button>
          </div>
        </Sider>
        <Drawer
          title="BrokenDev_ Storage"
          placement="left"
          closable={false}
          onClose={hideDrawer}
          visible={drawerVisible}
          bodyStyle={{ backgroundColor: '#2c2c2c', padding: '0' }}
          headerStyle={{ backgroundColor: '#2c2c2c', borderBottom: '1px solid #1f1f1f' }}
        >
          <div style={{ padding: '24px' }}>
            <UploadButton />
            <Button type="danger" icon={<LogoutOutlined />} block onClick={handleLogout} style={{ backgroundColor: 'red', color: '#fff', marginTop: '16px' }}>
              Logout
            </Button>
          </div>
        </Drawer>
        <Layout>
          <Content style={{ padding: '50px', backgroundColor: '#1f1f1f', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Text type="secondary" style={{ color: '#ddd' }}>Welcome to your basement! 😈</Text>
              <Button icon={<MenuOutlined />} onClick={showDrawer} style={{ display: 'block', marginLeft: 'auto' }}>
                Actions
              </Button>
            </div>
            {user && <FileLoader user={user} />}
          </Content>
        </Layout>
      </Layout>
    </Spin>
  );
};

export default Home;

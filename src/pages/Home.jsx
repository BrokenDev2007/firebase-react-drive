import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase'; // Ensure the correct path
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { LogoutOutlined } from '@ant-design/icons';
import UploadButton from '../components/uploadButton'; // Adjust the path as necessary

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false); // Set loading to false once authentication is checked
      if (!user) {
        navigate('/login');
      }
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

  return (
    <Spin spinning={loading} size="large">
      <Layout style={{ minHeight: '100vh', backgroundColor: '#1f1f1f' }}>
        <Sider width={200} style={{ background: '#2c2c2c', overflow: 'auto' }}>
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Title level={3} style={{ color: '#fff' }}>Cloud Storage</Title>
          </div>
          <div style={{ padding: '0 24px' }}>
            <UploadButton />
            <Button type="danger" icon={<LogoutOutlined />} block onClick={handleLogout} style={{ backgroundColor: 'red', color: '#fff', marginTop: '16px' }}>
              Logout
            </Button>
          </div>
        </Sider>
        <Layout>
          <Content style={{ padding: '50px', backgroundColor: '#1f1f1f', textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <Text type="secondary" style={{ color: '#ddd' }}>Your files, anywhere, anytime.</Text>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Spin>
  );
};

export default Home;

import React, { useState } from 'react';
import { Modal, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytes, listAll } from 'firebase/storage';
import { auth, storage } from '../../firebase/firebase';
import dayjs from 'dayjs';

const UploadButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        message.error('User is not authenticated.');
        setUploading(false);
        return;
      }

      const uidFolderRef = ref(storage, `${user.uid}`);
      const dateFolder = dayjs().format('DD-MM-YY');
      const dateFolderRef = ref(storage, `${user.uid}/${dateFolder}`);

      // Check if UID folder exists
      const uidFolderList = await listAll(uidFolderRef);
      if (!uidFolderList.prefixes.some(folder => folder.name === dateFolder)) {
        console.log('Creating date folder');
      }

      // Upload files
      const promises = fileList.map(file => {
        const fileRef = ref(storage, `${user.uid}/${dateFolder}/${file.name}`);
        return uploadBytes(fileRef, file.originFileObj);
      });

      await Promise.all(promises);

      message.success('Upload successful!');
      setFileList([]);
      window.location.reload();
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleChange = info => {
    setFileList(info.fileList);
  };

  return (
    <>
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={showModal}
        style={{
          width: '100%',
          marginBottom: '3px',
          backgroundColor: 'light-blue',
          color: '#fff',
          borderColor: 'light-blue'
        }}
      >
        Upload Files
      </Button>
      <Modal
        title="Upload Files"
        visible={isModalVisible}
        onOk={handleOk}
        confirmLoading={uploading}
        onCancel={handleCancel}
      >
        <Upload
          fileList={fileList}
          beforeUpload={() => false}
          onChange={handleChange}
          multiple
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
      </Modal>
    </>
  );
};

export default UploadButton;

import React, { useState } from 'react';
import { Modal, Button, Upload, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytes, listAll } from 'firebase/storage';
import moment from 'moment';
import { storage, auth } from '../../firebase/firebase'; // Ensure the correct path

const UploadButton = () => {
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    const dateFolder = moment().format('DD-MM-YY');
    const user = auth.currentUser;

    if (!user) {
      message.error('You need to be logged in to upload files.');
      setUploading(false);
      return;
    }

    try {
      const userFolderRef = ref(storage, `${user.uid}/${dateFolder}`);
      
      // Check if the folder exists by listing its contents
      const folderExists = await checkIfFolderExists(userFolderRef);

      if (!folderExists) {
        // Folder does not exist, but we don't need to create it explicitly. Just upload the files.
        await uploadFiles(fileList, user.uid, dateFolder);
      } else {
        // Folder exists, proceed with the upload
        await uploadFiles(fileList, user.uid, dateFolder);
      }

      message.success('Upload successful!');
      setFileList([]);
      setVisible(false);
    } catch (error) {
      console.error("Upload error: ", error);
      message.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const checkIfFolderExists = async (folderRef) => {
    const folderContents = await listAll(folderRef);
    return folderContents.items.length > 0 || folderContents.prefixes.length > 0;
  };

  const uploadFiles = async (files, userId, dateFolder) => {
    const uploadPromises = files.map(file => {
      const fileRef = ref(storage, `${userId}/${dateFolder}/${file.name}`);
      return uploadBytes(fileRef, file.originFileObj);
    });
    await Promise.all(uploadPromises);
  };

  const handleChange = ({ fileList }) => setFileList(fileList);

  return (
    <>
      <Button type="primary" icon={<UploadOutlined />} onClick={() => setVisible(true)}>
        Upload Files
      </Button>
      <Modal
        visible={visible}
        title="Upload Files"
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="back" onClick={() => setVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={uploading}
            onClick={handleUpload}
          >
            Confirm Upload
          </Button>,
        ]}
      >
        {uploading ? (
          <Spin tip="Uploading...">
            <Upload
              multiple
              fileList={fileList}
              onChange={handleChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Select Files</Button>
            </Upload>
          </Spin>
        ) : (
          <Upload
            multiple
            fileList={fileList}
            onChange={handleChange}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>
        )}
      </Modal>
    </>
  );
};

export default UploadButton;

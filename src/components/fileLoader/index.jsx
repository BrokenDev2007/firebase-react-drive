import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Typography, Spin, message, Button, Modal } from 'antd';
import { getStorage, ref, listAll, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import dayjs from 'dayjs';
import { FileOutlined, FileTextOutlined, FileImageOutlined, FilePdfOutlined, DownloadOutlined, CaretDownOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const formatDate = (dateStr) => {
  const date = dayjs(dateStr, 'DD-MM-YY');
  return date.format('DD MMMM YYYY');
};

const FileLoader = ({ user }) => {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [showOtherFiles, setShowOtherFiles] = useState(false);
  const [initialFiles, setInitialFiles] = useState([]);
  const [remainingFiles, setRemainingFiles] = useState([]);
  const [loadedFileCount, setLoadedFileCount] = useState(0);
  const filesPerLoad = 2;

  const fetchFiles = useCallback(async () => {
    const storage = getStorage();
    const userFolderRef = ref(storage, `${user.uid}`);
    console.log(`Fetching files for user folder: ${user.uid}`);

    try {
      const folderList = await listAll(userFolderRef);
      console.log('Fetched folder list:', folderList);
      const allFiles = {};

      for (const folder of folderList.prefixes) {
        const folderName = folder.name;
        try {
          const fileList = await listAll(ref(storage, `${user.uid}/${folderName}`));
          console.log(`Fetched files for folder: ${folderName}`, fileList);
          const filePromises = fileList.items.map(async (fileRef) => {
            const fileURL = await getDownloadURL(fileRef);
            const metadata = await getMetadata(fileRef);
            console.log(`Fetched file URL for ${fileRef.name}: ${fileURL}`);
            return { name: fileRef.name, url: fileURL, fullPath: fileRef.fullPath, timeCreated: metadata.timeCreated };
          });
          const filesInFolder = await Promise.all(filePromises);

          allFiles[folderName] = filesInFolder.sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated));
        } catch (error) {
          console.error(`Error loading files from folder ${folderName}:`, error);
          message.error(`Error loading files from folder ${folderName}: ${error.message}`);
        }
      }

      const sortedDates = Object.keys(allFiles).sort((a, b) => new Date(b.split('-').reverse().join('-')) - new Date(a.split('-').reverse().join('-')));

      const initial = sortedDates.slice(0, filesPerLoad);
      const remaining = sortedDates.slice(filesPerLoad);

      setFiles(allFiles);
      setInitialFiles(initial.reduce((acc, date) => ({ ...acc, [date]: allFiles[date] }), {}));
      setRemainingFiles(remaining);

    } catch (error) {
      console.error("Error listing user folders:", error);
      message.error(`Error listing user folders: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'txt') {
      return <FileTextOutlined style={{ fontSize: '64px' }} />;
    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
      return <FileImageOutlined style={{ fontSize: '64px' }} />;
    } else if (ext === 'pdf') {
      return <FilePdfOutlined style={{ fontSize: '64px' }} />;
    } else {
      return <FileOutlined style={{ fontSize: '64px' }} />;
    }
  };

  const handleDeleteFile = (file, folderName) => {
    confirm({
      title: 'Are you sure you want to delete this file?',
      onOk: async () => {
        try {
          const storage = getStorage();
          const fileRef = ref(storage, file.fullPath);
          await deleteObject(fileRef);
          message.success('File deleted successfully');

          // Remove the file from the state
          const updatedFiles = { ...files };
          updatedFiles[folderName] = updatedFiles[folderName].filter(f => f.name !== file.name);

          // Check if the folder is empty after deletion
          if (updatedFiles[folderName].length === 0) {
            delete updatedFiles[folderName];
          }

          setFiles(updatedFiles);

          if (initialFiles[folderName]) {
            const updatedInitialFiles = { ...initialFiles };
            updatedInitialFiles[folderName] = updatedInitialFiles[folderName].filter(f => f.name !== file.name);
            if (updatedInitialFiles[folderName].length === 0) {
              delete updatedInitialFiles[folderName];
            }
            setInitialFiles(updatedInitialFiles);
          } else {
            const updatedRemainingFiles = { ...remainingFiles };
            updatedRemainingFiles[folderName] = updatedRemainingFiles[folderName].filter(f => f.name !== file.name);
            if (updatedRemainingFiles[folderName].length === 0) {
              delete updatedRemainingFiles[folderName];
            }
            setRemainingFiles(updatedRemainingFiles);
          }
        } catch (error) {
          console.error('Error deleting file:', error);
          message.error(`Error deleting file: ${error.message}`);
        }
      }
    });
  };

  const handleShowOtherFiles = async () => {
    setLoading(true);
    const nextFilesToLoad = remainingFiles.slice(loadedFileCount, loadedFileCount + filesPerLoad);
    const updatedInitialFiles = { ...initialFiles };

    nextFilesToLoad.forEach((date) => {
      if (files[date]) {
        updatedInitialFiles[date] = files[date];
      }
    });

    setInitialFiles(updatedInitialFiles);
    setLoadedFileCount(loadedFileCount + filesPerLoad);
    setLoading(false);
  };

  return (
    <Spin spinning={loading} size="large">
      <div>
        {Object.keys(initialFiles).map((date) => (
          <div key={date} style={{ marginBottom: '20px' }}>
            <div style={{
              backgroundColor: '#2c2c2c',
              padding: '10px 20px',
              borderRadius: '8px',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{formatDate(date)}</Title>
            </div>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
              dataSource={initialFiles[date]}
              renderItem={file => (
                <List.Item>
                  <Card
                    title={file.name}
                    style={{ backgroundColor: '#2c2c2c', color: '#fff', textAlign: 'center' }}
                    headStyle={{ backgroundColor: '#3a3a3a', color: '#fff' }}
                    bodyStyle={{ backgroundColor: '#2c2c2c', color: '#fff' }}
                  >
                    {getFileIcon(file.name)}
                    <br />
                    <Button type="primary" href={file.url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '10px', marginRight: '10px' }}>
                      <DownloadOutlined /> Download
                    </Button>
                    <Button type="danger" onClick={() => handleDeleteFile(file, date)} style={{ marginTop: '10px', color: '#fff', backgroundColor: 'red' }}>
                      <DeleteOutlined /> 
                    </Button>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        ))}
        {!loading && loadedFileCount < remainingFiles.length && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={handleShowOtherFiles}>
              Show More Files <CaretDownOutlined />
            </Button>
          </div>
        )}
        {Object.keys(initialFiles).length === 0 && !loading && (
          <Typography style={{ color: '#fff', textAlign: 'center' }}>No files found.</Typography>
        )}
      </div>
    </Spin>
  );
};

export default FileLoader;

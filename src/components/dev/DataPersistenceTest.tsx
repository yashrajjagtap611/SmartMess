import React from 'react';
import { useMessProfile } from '../../contexts/MessProfileContext';
import { storageUtils } from '../../utils/storageUtils';

const DataPersistenceTest: React.FC = () => {
  const { messProfile, photo, isInitialized } = useMessProfile();

  const handleClearData = () => {
    storageUtils.clearMessProfileData();
    window.location.reload();
  };

  const handleShowData = () => {
    const data = storageUtils.getMessProfileData('mess_profile');
    console.log('Current localStorage data:', data);
    alert(`Current data:\n${JSON.stringify(data, null, 2)}`);
  };

  const handleCheckData = () => {
    const hasData = storageUtils.hasMessProfileData();
    alert(`Has mess profile data: ${hasData}`);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Data Persistence Test</h3>
      
      <div className="space-y-4">
        <div>
          <p><strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}</p>
          <p><strong>Has Photo:</strong> {photo ? 'Yes' : 'No'}</p>
          <p><strong>Mess Name:</strong> {messProfile.name}</p>
          <p><strong>Colleges:</strong> {messProfile.colleges.length}</p>
          <p><strong>Owner Phone:</strong> {messProfile.ownerPhone}</p>
          <p><strong>Owner Email:</strong> {messProfile.ownerEmail}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleShowData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Show localStorage Data
          </button>
          
          <button
            onClick={handleCheckData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Check Data Exists
          </button>
          
          <button
            onClick={handleClearData}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPersistenceTest; 
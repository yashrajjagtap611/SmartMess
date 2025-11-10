import React from 'react';
import { useJoinRequests } from './JoinRequests.hooks';
import { JoinRequestsView } from './components';

const JoinRequests: React.FC = () => {
  const joinRequestsProps = useJoinRequests();
  
  return <JoinRequestsView {...joinRequestsProps} />;
};

export default JoinRequests;


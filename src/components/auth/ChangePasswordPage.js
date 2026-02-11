import React from 'react';
import useAuth from '../../hooks/useAuth';
import ChangePassword from './ChangePassword';

const ChangePasswordPage = () => {
  const { currentUser } = useAuth();

  return <ChangePassword isForced={currentUser?.mustChangePassword || false} />;
};

export default ChangePasswordPage;

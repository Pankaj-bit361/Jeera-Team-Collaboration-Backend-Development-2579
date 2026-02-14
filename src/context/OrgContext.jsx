import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const OrgContext = createContext();

export const useOrg = () => useContext(OrgContext);

export const OrgProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const [currentOrg, setCurrentOrg] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.organizations) {
      setOrganizations(user.organizations);
      
      const storedOrgId = localStorage.getItem('organizationId');
      const foundOrg = user.organizations.find(o => o._id === storedOrgId);
      
      if (foundOrg) {
        setCurrentOrg(foundOrg);
      } else if (user.organizations.length > 0) {
        setCurrentOrg(user.organizations[0]);
        localStorage.setItem('organizationId', user.organizations[0]._id);
      } else {
        setCurrentOrg(null);
      }
    }
  }, [user]);

  const switchOrg = (orgId) => {
    const org = organizations.find(o => o._id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('organizationId', orgId);
      toast.success(`Switched to ${org.name}`);
      window.location.reload(); // Reload to refresh data with new org header
    }
  };

  const createOrg = async (name) => {
    try {
      const { data } = await api.post('/organizations', { name });
      setOrganizations([...organizations, data]);
      setCurrentOrg(data);
      localStorage.setItem('organizationId', data._id);
      
      // Update user context
      setUser(prev => ({ ...prev, organizations: [...prev.organizations, data] }));
      
      toast.success('Organization created!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
      return false;
    }
  };

  const joinOrg = async (inviteCode) => {
    try {
      const { data } = await api.post('/organizations/join', { inviteCode });
      
      // Check if already in list to avoid duplicates visually
      if (!organizations.find(o => o._id === data._id)) {
        setOrganizations([...organizations, data]);
        setUser(prev => ({ ...prev, organizations: [...prev.organizations, data] }));
      }
      
      setCurrentOrg(data);
      localStorage.setItem('organizationId', data._id);
      toast.success('Joined organization!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join organization');
      return false;
    }
  };

  return (
    <OrgContext.Provider value={{ currentOrg, organizations, switchOrg, createOrg, joinOrg, loading }}>
      {children}
    </OrgContext.Provider>
  );
};
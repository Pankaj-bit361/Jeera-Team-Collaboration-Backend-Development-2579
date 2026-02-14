import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useOrg } from '../context/OrgContext';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentOrg } = useOrg();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/organizations/members');
      setMembers(data.members);
      setPendingInvites(data.pendingInvites || []);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrg]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      await api.post('/organizations/invite', { email: inviteEmail });
      toast.success('Invitation sent!');
      setInviteEmail('');
      fetchMembers(); // Refresh lists
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite user');
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Management</h1>

      {/* Invite Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">Invite New Members</h2>
        <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg mb-6">
          <div className="bg-blue-100 p-2 rounded text-blue-600">
            <SafeIcon icon={FiIcons.FiKey} className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium">Organization Invite Code</p>
            <p className="text-xl font-mono font-bold text-blue-900">{currentOrg?.inviteCode}</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(currentOrg?.inviteCode);
              toast.success('Code copied!');
            }}
          >
            Copy Code
          </Button>
        </div>

        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            required
            placeholder="Enter email address"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Button type="submit" icon={FiIcons.FiSend}>Send Invite</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Members List */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <SafeIcon icon={FiIcons.FiUsers} className="text-gray-500" />
            Active Members ({members.length})
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {members.length === 0 ? (
              <div className="p-4 text-gray-500">No members found</div>
            ) : (
              members.map(member => (
                <div key={member._id} className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                    {member.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Invites */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <SafeIcon icon={FiIcons.FiClock} className="text-gray-500" />
            Pending Invites ({pendingInvites.length})
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {pendingInvites.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No pending invites</div>
            ) : (
              pendingInvites.map((email, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <span className="text-gray-600">{email}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
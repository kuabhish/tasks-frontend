import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { Team } from '../types/team';
import { addTeamMember, removeTeamMember, fetchUsers } from '../utils/api';
import { toast } from 'react-toastify';
import useUserStore from '../store/userStore';
import { User } from '../types/user';
import Badge from './ui/Badge';
import useTeamStore from '../store/teamStore';

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const { users, setUsers } = useUserStore();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (users.length === 0) {
        try {
          setIsLoadingUsers(true);
          const response = await fetchUsers();
          setUsers(response.data.data);
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to fetch users');
        } finally {
          setIsLoadingUsers(false);
        }
      }
    };
    loadUsers();
  }, [users, setUsers]);

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    try {
      setIsAddingMember(true);
      await addTeamMember(team.id, { user_id: selectedUserId });
      const user = users.find((u) => u.id === selectedUserId);
      if (user) {
        useTeamStore.getState().updateTeam(team.id, {
          members: [
            ...(team.members || []),
            {
              userId: user.id,
              teamId: team.id,
              joinedAt: new Date().toISOString(),
              user: { id: user.id, username: user.username, email: user.email, role: user.role },
            },
          ],
        });
      }
      toast.success('User added to team!');
      setSelectedUserId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add user to team');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember(team.id, userId);
      useTeamStore.getState().updateTeam(team.id, {
        members: (team.members || []).filter((m) => m.userId !== userId),
      });
      toast.success('User removed from team!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove user from team');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-900 truncate">{team.name}</h3>
      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
        {team.description || 'No description provided.'}
      </p>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Members</h4>
        {(team.members || []).length === 0 ? (
          <p className="text-gray-500 text-sm mt-2">No members in this team.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {(team.members || []).map((member) => (
              <li key={member.userId} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">{member.user.username}</span>
                  <Badge variant="primary" className="ml-2 text-xs">
                    {member.user.role}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <div className="relative flex-1">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={isLoadingUsers}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:bg-gray-100"
          >
            <option value="">{isLoadingUsers ? 'Loading users...' : 'Select a user'}</option>
            {users
              .filter((user) => !(team.members || []).some((m) => m.userId === user.id))
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
          </select>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddMember}
          disabled={isAddingMember || isLoadingUsers}
          className={isAddingMember ? 'opacity-75' : ''}
        >
          {isAddingMember ? 'Adding...' : 'Add Member'}
        </Button>
      </div>
    </div>
  );
};

export default TeamCard;
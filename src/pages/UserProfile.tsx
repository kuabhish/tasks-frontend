import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar'; // Added
import Button from '../components/ui/Button';
import { fetchUser, fetchTeams, addTeamMember, removeTeamMember } from '../utils/api';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import useTeamStore from '../store/teamStore';
import { Team } from '../types/team';
import { User } from '../types/user';

const UserProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { teams, setTeams } = useTeamStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      try {
        const [userResponse, teamsResponse] = await Promise.all([
          fetchUser(user.id),
          fetchTeams(),
        ]);
        setProfile(userResponse.data.data);
        setTeams(teamsResponse.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load profile data');
      }
    };
    loadData();
  }, [user, setTeams]);

  const handleAddTeam = async () => {
    if (!selectedTeamId || !user?.id) {
      toast.error('Please select a team');
      return;
    }
    try {
      await addTeamMember(selectedTeamId, { user_id: user.id });
      const team = teams.find((t) => t.id === selectedTeamId);
      if (team && profile) {
        setProfile({
          ...profile,
          teams: [
            ...(profile.teams || []),
            {
              ...team,
              members: [
                ...team.members,
                {
                  userId: user.id,
                  teamId: team.id,
                  joinedAt: new Date().toISOString(),
                  user: profile,
                },
              ],
            },
          ],
        });
      }
      toast.success('Joined team successfully!');
      setSelectedTeamId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join team');
    }
  };


  const handleRemoveTeam = async (teamId: string) => {
    if (!user?.id) return;
    try {
      await removeTeamMember(teamId, user.id);
      if (profile) {
        setProfile({
          ...profile,
          teams: profile.teams?.filter((t) => t.id !== teamId) || [],
        });
      }
      toast.success('Left team successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to leave team');
    }
  };

  if (!profile) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar /> {/* Added */}
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Team Memberships</h2>
                {profile.teams?.length === 0 ? (
                  <p className="text-gray-500">Not a member of any teams.</p>
                ) : (
                  <ul className="space-y-2">
                    {profile.teams?.map((team) => (
                      <li key={team.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-600">{team.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTeam(team.id)}
                        >
                          Leave Team
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex items-center space-x-2">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select a team to join</option>
                    {teams
                      .filter((team) => !profile.teams?.some((t) => t.id === team.id))
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                  <Button variant="primary" size="sm" onClick={handleAddTeam}>
                    Join Team
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
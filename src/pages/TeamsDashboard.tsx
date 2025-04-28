import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import TeamCard from '../components/TeamCard';
import useTeamStore from '../store/teamStore';
import { fetchTeams, createTeam } from '../utils/api';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import { PlusIcon } from 'lucide-react';
import { Team } from '../types/team';
import TeamForm from '../components/TeamForm';
import Sidebar from '../components/Sidebar';

const TeamsDashboard: React.FC = () => {
  const { teams, setTeams } = useTeamStore();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await fetchTeams();
        setTeams(response.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to fetch teams');
      }
    };
    loadTeams();
  }, [setTeams]);

  const handleOpenTeamModal = () => {
    setIsTeamModalOpen(true);
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalOpen(false);
  };

  const handleTeamSubmit = async (teamData: Omit<Team, 'id' | 'customerId' | 'createdAt' | 'updatedAt' | 'members'>) => {
    try {
      const response = await createTeam({
        name: teamData.name,
        description: teamData.description,
      });
      setTeams([...teams, response.data.data.team]);
      toast.success('Team created successfully!');
      handleCloseTeamModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Teams Dashboard</h1>
            <Button variant="primary" onClick={handleOpenTeamModal}>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Team
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.length === 0 ? (
              <p className="text-gray-500">No teams found. Create a new team to get started.</p>
            ) : (
              teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))
            )}
          </div>
        </main>

      </div>

      <Modal
        isOpen={isTeamModalOpen}
        onClose={handleCloseTeamModal}
        title="Create New Team"
        maxWidth="md"
      >
        <TeamForm onSubmit={handleTeamSubmit} onCancel={handleCloseTeamModal} />
      </Modal>
    </div>
  );
};

export default TeamsDashboard;
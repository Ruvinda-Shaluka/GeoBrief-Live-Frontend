import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout, updateUser } from '../../store/slices/authSlice';
import userService from '../../services/userService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updateData: { name?: string; password?: string } = { name };
      if (password) updateData.password = password;

      const updatedUser = await userService.updateProfile(updateData, token as string);
      dispatch(updateUser(updatedUser)); // Instantly updates Navbar avatar!
      setSuccess('Profile updated successfully');
      setPassword(''); // Clear password field for security
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      try {
        await userService.deleteProfile(token as string);
        dispatch(logout()); // Clears state and routes to /login via ProtectedRoute
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold mb-6">User Profile</h2>

        {error && <div className="mb-4 p-2 bg-red-900/20 text-red-400 rounded text-sm text-center">{error}</div>}
        {success && <div className="mb-4 p-2 bg-green-900/20 text-green-400 rounded text-sm text-center">{success}</div>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email (Read Only)</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="w-full bg-darkBg/50 border border-darkBorder rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-darkBg border border-darkBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandPrimary"
            />
          </div>

          {user?.authProvider === 'local' && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">New Password (Optional)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-darkBg border border-darkBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>
          )}

          <button type="submit" className="w-full bg-brandPrimary hover:bg-purple-500 text-white py-2 rounded-lg transition-colors mt-4">
            Save Changes
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-darkBorder space-y-3">
          <button onClick={handleLogout} className="w-full border border-darkBorder hover:bg-darkBg text-slate-300 py-2 rounded-lg transition-colors">
            Sign Out
          </button>
          <button onClick={handleDelete} className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
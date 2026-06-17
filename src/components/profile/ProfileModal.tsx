import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout, updateUser } from '../../store/slices/authSlice';
import userService from '../../services/userService';
import ConfirmModal from '../layout/ConfirmModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Eye icon states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Custom confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updateData: { name?: string; currentPassword?: string; newPassword?: string } = { name };
      
      // If they typed a new password, attach both passwords to the request
      if (newPassword) {
        if (!currentPassword) {
          setError('Please enter your current password to set a new one.');
          return;
        }
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const updatedUser = await userService.updateProfile(updateData, token as string);
      dispatch(updateUser(updatedUser)); 
      setSuccess('Profile updated successfully');
      
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const executeDelete = async () => {
    try {
      await userService.deleteProfile(token as string);
      dispatch(logout()); 
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  // Reusable Eye Button Component
  const EyeButton = ({ show: _show, setShow }: { show: boolean, setShow: (val: boolean) => void }) => (
    <button
      type="button"
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
      onMouseDown={() => setShow(true)}
      onMouseUp={() => setShow(false)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(true)}
      onTouchEnd={() => setShow(false)}
      title="Hold to show password"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-md p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
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
            <label className="block text-sm font-medium text-slate-400 mb-1">Email (Read Only)</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="w-full bg-darkBg/50 border border-darkBorder rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-darkBg border border-darkBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-colors"
            />
          </div>

          {/* Only show password fields if they are a local user (not Google) */}
          {user?.authProvider === 'local' && (
            <div className="pt-4 border-t border-darkBorder mt-4">
              <h3 className="text-sm font-semibold text-white mb-3">Change Password</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Required to set new password"
                      className="w-full bg-darkBg border border-darkBorder rounded-lg pl-4 pr-10 py-2 text-white text-sm focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-colors"
                    />
                    <EyeButton show={showCurrentPassword} setShow={setShowCurrentPassword} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Must be at least 6 characters"
                      className="w-full bg-darkBg border border-darkBorder rounded-lg pl-4 pr-10 py-2 text-white text-sm focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-colors"
                    />
                    <EyeButton show={showNewPassword} setShow={setShowNewPassword} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-brandPrimary hover:bg-purple-500 text-white font-semibold py-2.5 rounded-lg transition-colors mt-6">
            Save Changes
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-darkBorder space-y-3">
          <button onClick={handleLogout} className="w-full border border-darkBorder hover:bg-darkBg text-slate-300 py-2 rounded-lg transition-colors">
            Sign Out
          </button>
          <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Account"
        message="Are you absolutely sure? This action cannot be undone and you will lose all reported incident entries and group memberships."
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
        onConfirm={async () => {
          setIsDeleteConfirmOpen(false);
          await executeDelete();
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default ProfileModal;
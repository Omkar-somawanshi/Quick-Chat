import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets'; // make sure this path is correct

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState('MAARTIN JOHNSON');
  const [bio, setBio] = useState("Hi Everyone, I am Using QuickChat");

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImg(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      {/* Main Box */}
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex max-sm:flex-col rounded-lg">
        
        {/* LEFT: Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-lg">Profile details</h3>

          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
            <input
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
              onChange={handleFileChange}
            />
            <img
              src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon}
              alt="avatar"
              className={`w-12 h-12 ${selectedImg ? 'rounded-full' : ''}`}
            />
            Upload profile image
          </label>

          <div className="flex flex-col gap-2">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-b border-gray-500 outline-none text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-transparent border border-gray-500 rounded-md p-2 outline-none text-white"
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>

        {/* RIGHT: Profile Image Preview */}
        <div className="flex items-center justify-center p-6">
          <img
            className="w-50 h-50 object-cover rborder-2 border-gray-500"
            src={ assets.logo_icon}
            alt="profile-preview"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

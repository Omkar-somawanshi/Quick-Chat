import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {


  const [selectedImg, setSelectedImg]=useState(null)
  const navigate = useNavigate();
  const [name, setName] = useState('MAARTIN JOHNSON');
  const [bio,setBio]=useState("Hi Everyone, I am Using QuickChat")
  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 items-center justify-center max-sm:flex-col-reverse rounded-lg'>
        <form className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'> Profile details</h3>
        <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'></label>

<input type="file" id="avatar" accept='.png,jpg,.jpeg' hidden />
<img src={} alt="" />
        </form>
        <img src="" alt="" />
      </div>


    </div>
  )
}

export default ProfilePage
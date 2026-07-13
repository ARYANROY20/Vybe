import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const Profile = () => {
  const {profileId}=useParams()

  const [user,setUser]=useState(null)
  const [posts,setPosts]=useState([])

  return (
    <div>
      
    </div>
  )
}

export default Profile

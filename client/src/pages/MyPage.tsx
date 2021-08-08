import { useEffect, useState } from 'react';
import { getProfile } from '../api/api';
import { IUser } from '../interface/userInterface';

const MyPage = () => {
  const [userInfo, setUserinfo] = useState<IUser>({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    picture: '',
  });

  const reqGetUserInfo = async () => {
    try {
      const response = await getProfile();
      const data = response.data;
      setUserinfo({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        picture: data.picture,
      });
    } catch (err) {
      //   console.log(err);
    }
  };

  useEffect(() => {
    reqGetUserInfo();
  }, []);

  const { id, email, firstName, lastName, picture } = userInfo;
  return (
    <div>
      <h2>My Page </h2>
      <div>id: {id}</div>
      <div>email: {email}</div>
      <div>firstName: {firstName}</div>
      <div>lastName: {lastName}</div>
      <div id="profile-wrapper">
        <img id="profile" src={picture} alt="profile"></img>
      </div>
      {/* <div>ladderScore: {}</div> */}
    </div>
  );
};

export default MyPage;

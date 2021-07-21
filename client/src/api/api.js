import axios from 'axios';

const ip = process.env.REACT_APP_GAME_SERVER_IP;
const port = process.env.REACT_APP_GAME_SERVER_PORT;
const apiUrl = `http://${ip}:${port}`;

const instance = axios.create({
  baseURL: apiUrl,
});

export const getList = async () => {
  return await instance.get(`/game/list`);
};

export const createRoom = async (roomInfo) => {
  return await instance.post(`/game/new`, roomInfo);
};

export const enterPrivateRoom = async (data) => {
  return await instance.post(`/game/checkRoomValidate`, data);
};

export const getAllStats = async (username) => {
  return await instance.get(`/game/result/${username}/count/all`);
};

export const getWinStats = async (username) => {
  return await instance.get(`/game/result/${username}/count/win`);
};

export const getLoseStats = async (username) => {
  return await instance.get(`/game/result/${username}/count/lose`);
};

export const getAllGames = async (username) => {
  return await instance.get(`game/result/${username}/all`);
};

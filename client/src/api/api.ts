import axios from 'axios';
import { IRoom } from '../interface/interface';

const ip = process.env.REACT_APP_GAME_SERVER_IP;
const port = process.env.REACT_APP_GAME_SERVER_PORT;
const apiUrl = `http://${ip}:${port}`;

const instance = axios.create({
  baseURL: apiUrl,
});

export const getList = async () => {
  return await instance.get(`/game/list`);
};

export const createRoom = async (roomInfo: IRoom) => {
  return await instance.post(`/game/new`, roomInfo);
};

export const enterPrivateRoom = async (data: { roomId: string; password: string; mode: string }) => {
  return await instance.post(`/game/checkRoomValidate`, data);
};

export const getAllStats = async (username: string) => {
  return await instance.get(`/game/result/${username}/count/all`);
};

export const getWinStats = async (username: string) => {
  return await instance.get(`/game/result/${username}/count/win`);
};

export const getLoseStats = async (username: string) => {
  return await instance.get(`/game/result/${username}/count/lose`);
};

export const getAllGames = async (username: string) => {
  return await instance.get(`game/result/${username}/all`);
};

export const checkUserRoom = async (username: string) => {
  return await instance.get(`game/room/${username}`);
};

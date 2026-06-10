import axios from "axios";

const API = "http://localhost:5000/api/properties";

export const getAllProperties = () =>
  axios.get(API);

export const getPropertyById = (id) =>
  axios.get(`${API}/${id}`);

export const getOwnerProperties = (ownerId) =>
  axios.get(`${API}/owner/${ownerId}`);

export const getOwnerStats = (ownerId) =>
  axios.get(`${API}/owner-stats/${ownerId}`);
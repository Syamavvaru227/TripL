import client from "./client"
export const getNearbyPlaces = (city, radius = 30, category = "") =>
  client.get("/places/nearby", { params: { city, radius, ...(category && { category }) } })
export const getNearbyPlacesByCoords = (lat, lng, radius = 30, category = "") =>
  client.get("/places/nearby", { params: { latitude: lat, longitude: lng, radius, ...(category && { category }) } })
export const getPlaceById = (id) => client.get(`/places/${id}`)

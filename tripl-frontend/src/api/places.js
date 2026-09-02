import client from "./client"

export const getNearbyPlaces = (city, radius = 30, category = "") =>
  client.get("/places/nearby", { params: { city, radius, ...(category && { category }) } })

export const getNearbyPlacesByCoords = (lat, lng, radius = 30, category = "", city = "") =>
  client.get("/places/nearby", {
    params: {
      latitude: lat,
      longitude: lng,
      radius,
      ...(city && { city }),
      ...(category && { category }),
    },
  })

export const getPlaceById = (id) => client.get(`/places/${id}`)
export const getWikiHistory = (name) => client.get(`/places/wiki-history`, { params: { name } })

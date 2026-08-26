import client from "./client"
export const getTransportOptions = (fromLat, fromLng, toLat, toLng) =>
  client.get("/transport/options", { params: { from_lat: fromLat, from_lng: fromLng, to_lat: toLat, to_lng: toLng } })

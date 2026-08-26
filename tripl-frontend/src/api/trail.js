import client from "./client"
export const generateTrail = (payload) => client.post("/trail/generate", payload)
export const saveTrail = (payload) => client.post("/trail/save", payload)

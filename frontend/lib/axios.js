// lib/axios.js
import axios from 'axios'

// Tell axios to send & accept cookies on every request
axios.defaults.withCredentials = true
// Point this at your Express server (make sure you have this in .env.local)
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

export default axios

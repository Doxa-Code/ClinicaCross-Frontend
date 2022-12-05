import axios from 'axios'
import socketIO from 'socket.io-client'
import { apiURL } from '../constants'

export const api = axios.create({
  baseURL: apiURL
})
export const ws = socketIO(`${apiURL}`, {
  transports: ['websocket']
})

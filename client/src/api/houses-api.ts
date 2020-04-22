import { apiEndpoint } from '../config'
import { Home } from '../types/Home';
import { CreateHomeRequest } from '../types/CreateHomeRequest';
import Axios from 'axios'
import { UpdateHomeRequest } from '../types/UpdateHomeRequest';

export async function getHouse(idHouse: string, idToken: string): Promise<Home> {
  console.log(`Fetching House ${idHouse}`)

  const response = await Axios.get(`${apiEndpoint}/homes/${idHouse}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Home:', response.data)
  return response.data.item
}

export async function getHouses(idToken: string): Promise<Home[]> {
  console.log('Fetching Houses')

  const response = await Axios.get(`${apiEndpoint}/homes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Homes:', response.data)
  return response.data.items
}

export async function createTodo(
  idToken: string,
  newTodo: CreateHomeRequest
): Promise<Home> {
  const response = await Axios.post(`${apiEndpoint}/homes`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchHome(
  idToken: string,
  homeId: string,
  updatedHome: UpdateHomeRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/homes/${homeId}`, JSON.stringify(updatedHome), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteTodo(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/homes/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/homes/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

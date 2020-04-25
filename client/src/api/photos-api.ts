import { apiEndpoint } from '../config'
import { Photo } from '../types/Photo';

import Axios from 'axios'




export async function getPhotos(homeId: string,idToken: string): Promise<Photo[]> {
  console.log('Fetching Houses')

  const response = await Axios.get(`${apiEndpoint}/homes/${homeId}/photos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Photos:', response.data)
  return response.data.result
}

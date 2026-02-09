import AxiosClient from '../AxiosClient';
import { isFigmaRoute, mockEstateInfo } from './figmaMockData';

export default async function EstateInfoLoader({ params }) {
  // On /figma routes, return mock data directly
  if (isFigmaRoute()) {
    return mockEstateInfo;
  }
  
  const response = await AxiosClient.get('/post/' + params.id);
  return response.data;
}

import AxiosClient from '../AxiosClient';

export default async function EstateInfoLoader({ params }) {
  const response = await AxiosClient.get('/post/' + params.id);
  return response.data;
}

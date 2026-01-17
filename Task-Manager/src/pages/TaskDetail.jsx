import { useParams } from 'react-router-dom';

export default function TaskDetail() {
  const { id } = useParams(); // Grabs the ID from the URL
  return <h1>Details for Task ID: {id}</h1>;
}
import axios from 'axios';

const Scheduler = axios.create({
  baseURL: 'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3000.app.github.dev/api/v1',
});

export default Scheduler;
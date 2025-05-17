import axios from 'axios';

const request = axios.create({
    url: 'http://192.168.100.2:7777',
})

export default request;
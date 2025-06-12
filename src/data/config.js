
const config = {
    development: {
      API_BASE_URL: 'http://localhost:5000',
    },
    production: {
      API_BASE_URL: 'https://awos-backend.lusep.fi',
    },
};

const environment = 'production'; // development or production

export const METARS_URL = `${config[environment].API_BASE_URL}/api/metars`;
export const LOGIN_URL = `${config[environment].API_BASE_URL}/auth/vatsim`;
export const USER_URL = `${config[environment].API_BASE_URL}/api/user`;
export const LOGOUT_URL = `${config[environment].API_BASE_URL}/auth/logout`;

export const URL_START = `${config[environment].API_BASE_URL}`;
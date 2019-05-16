import './plugins/vuetify'
import App from './App.vue'
import axios from 'axios'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import LandingPage from './components/LandingPage'
import TicketShop from './components/TicketShop'
import Vue from 'vue'
import VueRouter from 'vue-router'

// Load environment vars
dotenv.config();

// Configure the router
Vue.use(VueRouter);
const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: LandingPage
    }, {
      path: '/ticket-shop',
      component: TicketShop
    },
  ],
});

// Configure api
const $axios = axios.create({
  baseURL:  process.env.VUE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor
$axios.interceptors.response.use(response =>  {
  // Do something with response data
  return response;
}, function (error) {
  if (error && error.response && error.response.status === 401) {
    router.push('/');
  }
  // Do something with response error
  return Promise.reject(error);
});

// Set token if authenticated
const token = window.localStorage.token;
if (token) {
  $axios.defaults.headers.common['Authorization'] = token;
}

Vue.prototype.$axios = $axios;

// Func to get the user from jwt
Vue.prototype.$user = () => {
  const token = window.localStorage.token;
  if (!token) return;
  return jwt.decode(token);
};

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');

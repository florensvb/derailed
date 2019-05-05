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

// Configure api
const $axios = axios.create({
  baseURL:  process.env.VUE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const token = window.localStorage.token;
if (token) {
  $axios.defaults.headers.common['Authorization'] = token;
}

Vue.prototype.$axios = $axios;

Vue.prototype.user = () => {
  const token = window.localStorage.token;
  if (!token) return;
  return jwt.decode(token);
};


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

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');

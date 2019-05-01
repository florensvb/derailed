import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'

import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios);

axios.defaults.baseURL = 'http://localhost:3000';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';

Vue.prototype.$axios = axios;

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app')

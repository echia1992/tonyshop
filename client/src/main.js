import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import Cookies from 'vue-cookies'
Vue.config.productionTip = false
Vue.use(Cookies, {expires: '7d'})
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

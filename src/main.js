import Vue from 'vue'
import PasswordInput from './components/PasswordInput.vue'
import vuetify from './plugins/vuetify'


Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(PasswordInput)
}).$mount('#app')

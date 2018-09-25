// main
import Vue from 'vue'
//import Vuetify from 'vuetify'
import 'babel-polyfill'
import FastClick from 'fastclick'
import './stylus/main.styl'
import App from './App'
import router from './router'
import store from './store'
import { i18n }  from './locales/index'
require('./filters/index')
require('./directives/swiper')
import imageHW from './directives/imageHW'
require('./api/index')
// import { setVuexStore } from './streams'
import { AXIOS_DEFAULT_TIMEOUT } from './api/gateways'
import axios from 'axios'
require('./api/utils')

// animate.css
// import 'animate.css'
Vue.directive('image-wrapper', imageHW)

import VueAwesomeSwiper from 'vue-awesome-swiper'
Vue.use(VueAwesomeSwiper)

var VueCordova = require('./libs/vue-cordova');
Vue.use(VueCordova);


import Toasted from 'vue-toasted';
Vue.use(Toasted,{
  theme: "primary",
  position: "bottom-center",
  duration : 3000
})

// add cordova.js only if serving the app through file://
if (window.location.protocol === 'file:' || window.location.port === '3000') {
  var cordovaScript = document.createElement('script')
  cordovaScript.setAttribute('type', 'text/javascript')
  cordovaScript.setAttribute('src', 'cordova.js')
  document.body.appendChild(cordovaScript)
}

// Vue.use(Vuetify)
// Vue.use(Vuetify, {
//   theme: {
//     primary: '#cfa15a',
//     error: "#ff0000",
//     notice: "#303034",
//   }
// })

import '@/libs/pkgs/initVuetify'

FastClick.prototype.focus = function(targetElement) {
	var length;
	// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month' && targetElement.type !== 'number') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};
FastClick.attach(document.body)
Vue.config.productionTip = false


axios.defaults.timeout = AXIOS_DEFAULT_TIMEOUT


// setVuexStore(store)

/* eslint-disable no-new */
export const app =new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App }
})

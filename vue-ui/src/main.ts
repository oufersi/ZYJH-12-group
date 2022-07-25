import Vue from 'vue';
import router from './router';
import 'normalize.css/normalize.css';
import { edger } from '@edgeros/web-sdk';
import App from './App';
import { initSocket } from './services/socket';
import { setSrand, setToken } from './services/auth';
edger.avoidKeyboardOverlay();

Vue.config.productionTip = false;
Vue.prototype.$edger = edger;

edger.onAction('token', data => {
  if (data) {
    setToken(data.token);
    setSrand(data.srand);
  }
});

edger
  .token()
  .then(data => {
    if (data) {
      setToken(data.token);
      setSrand(data.srand);
      initSocket();
    }
  })
  .catch((error: Error) => {
    throw error;
  })
  .finally(() => {
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app');
  });

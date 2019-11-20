import Vue from 'vue'
import App from './App.vue'

import Axios from 'axios'
import Luxian from 'luxian'

Vue.config.productionTip = false

const routeList = {
    routes: {
        "current-user": 'api/users/current',
        "application-routes": 'api/application/routes',
        "user": "api/users/{id}",
        "some_strange-name.usedHere": "some/strange/{name}/here",
        "surveyResults.search": "results/survey/",
        "postal-codes": "api/codes/postal/{countryCode}"
    }
}

Vue.use(Luxian, {
    httpHandler: Axios,
    urlBase: 'https://localhost:8080/',
    routeList
})


new Vue({
  render: h => h(App),
}).$mount('#app')

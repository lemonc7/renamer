import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"
import ui from "@nuxt/ui/vue-plugin"
import router from "./router"
import { createPinia } from "pinia"
import { PiniaColada } from "@pinia/colada"

const app = createApp(App)

app.use(router)
app.use(ui)
app.use(createPinia())
app.use(PiniaColada, {
  queryOptions: {
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  }
})

app.mount("#app")

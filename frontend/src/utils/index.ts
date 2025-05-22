import { useRouter,useRoute } from "vue-router"

let router = useRouter()
let route = useRoute()
export default {
  methods: {
    appendRoute() {
      let newPath = `${route.path}/lemoncnas`.replace(/\/+/g, '/')
      router.push(newPath)
      console.log("test");
      
    }
  }
}
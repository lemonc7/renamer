<script lang="ts">
  import { route } from "src/router"

  let path = $derived(route.pathname)
</script>

<h1>main</h1>
<p>current route: {path}</p>

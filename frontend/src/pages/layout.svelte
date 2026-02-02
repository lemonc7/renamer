<script lang="ts">
  import { navigate, route } from "src/router";
  let path = $derived(route.pathname);
</script>

<h1>route: {path}</h1>

<button onclick={() => navigate("/home/lemonc")}>test</button>

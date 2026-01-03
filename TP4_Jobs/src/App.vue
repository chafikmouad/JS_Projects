<template>
  <div id="app">
    <div>
      <button >
        <router-link to="/">User</router-link>
      </button>
      <button >
        <router-link to="/administrator">Administrator</router-link>
      </button>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
/* App layout and navigation */
#app {
  margin: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  color: #333;
  background: #f7f9fb;
  min-height: 100vh;
}

div > button {
  background: #2b6cb0;
  color: #fff;
  border: none;
  padding: 0.45rem 0.7rem;
  margin-right: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

div > button router-link,
div > button a {
  color: inherit;
  text-decoration: none;
}

div > button:hover {
  background: #234a7a;
}

router-view {
  display: block;
  margin-top: 1rem;
}
</style>

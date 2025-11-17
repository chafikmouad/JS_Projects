<template>
  <div id="app">
    <header>
      <h1> Gestion des taches </h1>
    </header>
    <main>
      <TaskList />
    </main>
  </div>
</template>

<script>
import TaskList from './components/TaskList.vue'

export default {
  name: 'App',
  components: {TaskList}
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

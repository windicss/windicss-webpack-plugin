<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <nav>
    Windi test CSS
  </nav>
  <div
    class="px-5 p-1 text-red hover:(text-green-100 rounded-full bg-teal-900)"
    :class="{ 'bg-teal-100': true, 'hover:w-1/3': true }"
  >
    Hello World
  </div>
  <h2 class="btn">
    Button
  </h2>
  <div class="bar">
    Bar
  </div>
  <button
    bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
    text="sm white"
    font="mono light"
    p="y-2 x-4"
    border="2 rounded blue-200"
  >
    Attributify Mode
  </button>
  <PostcssScoped />
  <ScssScoped />
  <SassScoped />
  <StylusScoped />
  <LessScoped />
  <CssScoped />
</template>

<script>
import PostcssScoped from './components/PostcssScoped'
import ScssScoped from './components/ScssScoped'
import SassScoped from './components/SassScoped'
import StylusScoped from './components/StylusScoped'
import LessScoped from './components/LessScoped'
import CssScoped from './components/CssScoped'
import './assets/test.css'
import 'windi-devtools'

export default {
  name: 'App',
  components: {
    PostcssScoped,
    ScssScoped,
    SassScoped,
    StylusScoped,
    LessScoped,
    CssScoped
  }
}
</script>

<style lang="postcss" scoped>
.bar {
  @apply bg-pink-400 text-white p-4 w-1/4;
}

@screen md {
  .bar {
    background: red;
  }
}
</style>

<template>
  <div id="app">
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
			<Foo />

			<div class="bg-black bg-blue-200 bg-red-200">
				Without ! (red)
			</div>
			<div class="bg-black !bg-blue-200 bg-red-200">
				With ! (blue)
			</div>
  </div>
</template>

<script>
import Foo from './components/Foo'
import 'windi.css'
import './assets/test.css'

export default {
  name: 'App',
	components: {
		Foo
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

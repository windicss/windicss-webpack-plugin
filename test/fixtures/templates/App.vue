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

			<div class="bg-black bg-blue-200 bg-red-200">
				Without ! (red)
			</div>
			<div class="bg-black !bg-blue-200 bg-red-200">
				With ! (blue)
			</div>
    <div class="less-global">
      <h2>Less global</h2>
    </div>
    <div class="scss-global">
      <h2>SCSS global</h2>
    </div>
    <div class="sass-global">
      <h2>SASS global</h2>
    </div>
    <div class="css-global">
      <h2>CSS global</h2>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

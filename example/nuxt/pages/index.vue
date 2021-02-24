<template>
<div>
	<nav class="bg-teal-50 text-white">
		Windi CSS
	</nav>
	<div
			class="px-5 p-1 mx-auto text-10xl font-light bg-red-200 text-white transition-all hover:(text-green-100 rounded-full bg-teal-900)"
			:class="{ 'hover:w-1/3': true }"
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

	<div class="bg-black !bg-red-200 bg-blue-200">
		Without ! (red)
	</div>
	<div class="bg-black !bg-blue-200 bg-red-200">
		With ! (blue)
	</div>
</div>
</template>
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

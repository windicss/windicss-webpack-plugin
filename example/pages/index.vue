<template>
<div>
	<h1 class="text-3xl text-red-500 text-underline">{{ message }}</h1>
</div>
</template>
<script>
export default {
	data() {
		return {
			message: 'Hello World'
		}
	}
}
</script>
<style>
h1 {
	font-weight: bold;
}
</style>

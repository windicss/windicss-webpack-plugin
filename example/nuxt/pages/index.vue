<template>
<div>
	<nav class="bg-red-200 text-blue-700">
		Windi CSS 4
	</nav>
	<div
			class="px-5 p-1 mx-auto text-4xl font-light bg-red-200 text-white transition-all hover:(text-green-100 rounded-full bg-teal-900)"
			:class="{ 'hover:w-1/2': true }"
	>
		Hello World 33
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
    Attributify Button
  </button>
  <div class="scss-global">
    <h2>SCSS global</h2>
  </div>
  <PostcssScoped />
  <ScssScoped />
  <SassScoped />
  <StylusScoped />
  <LessScoped />
  <CssScoped />
</div>
</template>

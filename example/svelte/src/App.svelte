<script>
import 'windi.css'
	export let name;
</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
  <nav class="bg-teal-50 text-white">
    Windi CSS
  </nav>
  <div
    class="px-5 p-1 mx-auto text-5xl font-light bg-red-200 text-white transition-all hover:(text-green-100 rounded-full bg-teal-900)"
  >
    Hello World
  </div>
  <h2 class="btn">
    Button
  </h2>
  <div class="bar">
    Bar
  </div>
  <div class="bg-black !bg-red-200 bg-blue-200">
    Without ! (red)
  </div>
  <div class="bg-black !bg-blue-200 bg-red-200">
    With ! (blue)
  </div>
</main>

<style lang="postcss">
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
  .bar {
    @apply bg-pink-900 text-white p-4 w-1/4;
  }

  @screen md {
    .bar {
      @apply bg-pink-300;
    }
  }
</style>

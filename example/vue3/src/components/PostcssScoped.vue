<template>
  <div class="postcss">
    PostCSS scoped<br>
    pink-400 -> pink-900
  </div>
</template>
<style lang="postcss" scoped>
.postcss {
  @apply bg-pink-400 text-white p-4 w-1/4 transition hover:(bg-pink-900 text-pink-100);
}
</style>

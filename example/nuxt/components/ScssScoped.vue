<template>
  <div class="scss">
    SCSS scoped<br>
    blue-400 -> blue-900
  </div>
</template>
<style lang="scss" scoped>
.scss {
  @apply bg-blue-400 text-white p-4 w-1/4 transition hover:(bg-blue-900 text-blue-100);
}
</style>

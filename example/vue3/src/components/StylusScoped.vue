<template>
  <div class="stylus">
    Stylus scoped<br>
    red-400 -> red-900
  </div>
</template>
<style lang="stylus" scoped>
.stylus
  @apply " bg-red-400 text-white p-4 w-1/4 transition hover:(bg-red-900 text-red-100)"
</style>

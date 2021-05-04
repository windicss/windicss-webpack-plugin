<template>
  <div class="less">
    LESS scoped<br>
    purple-400 -> purple-900
  </div>
</template>
<style lang="less" scoped>
.less {
  @apply " bg-purple-400 text-white p-4 w-1/4 transition hover:(bg-purple-900 text-purple-100)";
}
</style>

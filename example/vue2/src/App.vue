<i18n>
{
  "en": {
    "hello": "hello world!"
  },
  "ja": {
    "hello": "JAPAN こんにちは、世界！"
  }
}
</i18n>

<template>
<div id="app">
  <div class="container mx-auto">
    <nav>
      Windi test CSS

    </nav>
    <div
      class="px-5 p-1 text-red hover:(text-green-100 rounded-full bg-teal-900)"
      :class="{ 'bg-teal-100': true, 'hover:w-1/3': true }"
    >
      <p>{{ $t('hello') }}</p>
    </div>
    <HelloI18n />
    <PostcssScoped />
    <ScssScoped />
    <SassScoped />
    <StylusScoped />
    <LessScoped />
    <CssScoped />
  </div>
</div>
</template>

<script>
import PostcssScoped from './components/PostcssScoped'
import ScssScoped from './components/ScssScoped'
import SassScoped from './components/SassScoped'
import StylusScoped from './components/StylusScoped'
import LessScoped from './components/LessScoped'
import CssScoped from './components/CssScoped'
import HelloI18n from './components/HelloI18n'
import './assets/test.css'
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default {
  name: 'App',
  components: {
    PostcssScoped,
    ScssScoped,
    SassScoped,
    StylusScoped,
    LessScoped,
    CssScoped,
    HelloI18n
  },
  mounted () {
    console.log(videojs)
  }
}
</script>

<template>
  <div class="login2-box min-h-screen relative">
    <video
      id="loginVideo"
      class="h-full w-full absolute left-0 top-0 right-0 bottom-0 object-cover"
      style="z-index: -1;"
      muted=""
      autoplay=""
      loop=""
      poster="./bg.png"
      src="./bg.mp4"
    />

    <div class="login2-main min-h-screen w-full">
      <div
        class="mx-auto min-h-screen flex items-center p-df"
        style="max-width:1200px;"
      >
        <ul class="w-full flex justify-center md:justify-between">
          <li class="text-white text-6xl hidden-xs-only">
            <div>
              <img src="./logo.png" alt="" />
            </div>

            <div class="text-6xl font-semibold py-lg my-lg">
              {{ webBasicConfig.webName }}
            </div>

            <div class="inline-block">
              <span class="inline-block typing typing-first">
                Big data operations.Industry leader.
              </span>
            </div>
            <div class="mt-lg"></div>
            <div class="inline-block">
              <span class="inline-block typing typing-second">
                {{ webBasicConfig.webName }} is different
              </span>
            </div>
            <div class="mt-lg"></div>
            <div class="inline-block">
              <span class="inline-block typing typing-third">
                because of wisdom.
              </span>
            </div>
            <div class="mt-lg">
              —
            </div>
          </li>

          <li style="width:360px;min-width:360px;">
            <slot />

            <div class="text-center pt-lg text-white">
              <span class="text-sm mr-lg">
                Copyright © {{ new Date().getFullYear() }}
                {{ $root.webName }}
              </span>

              <Language style="color: #fefefe;" ref="LanguageRef">
                <span
                  style="border: 1px solid rgba(255,255,254,0.3);"
                  class="inline-block px-df py-2 font-bold text-sm whitespace-no-wrap rounded-lg"
                  >{{ $i18n.locale === 'cn' ? '简体中文' : 'English' }}
                  <i class="el-icon-caret-bottom ml-2"></i>
                </span>
              </Language>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    webBasicConfig({ $root }) {
      return $root.webConfig.basic
    }
  },
  created() {},
  mounted() {
    const loginVideo = document.getElementById('loginVideo')
    // 控制视频播放速度
    loginVideo.playbackRate = 0.8
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.login2-box {
  .login2-main {
    background-color: rgba(18, 18, 18, 0.8);
  }
  // 实现打字效果，
  .typing {
    overflow: hidden;
    white-space: nowrap;
    border-right: 0.15em solid #fefefe;
    border-color: transparent;
    animation: typing 2s steps(40, end), blink-caret 0.5s step-end 4;
  }
  @keyframes typing {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }

  @keyframes blink-caret {
    from,
    to {
      border-color: transparent;
    }
    50% {
      border-color: #fefefe;
    }
  }

  .typing-second {
    animation-delay: 2s;
  }
  .typing-third {
    animation-delay: 4s;
  }
}
</style>

<style lang="scss">
.login2-box {
  .captcha-box {
    border-radius: 4px;
    input {
      border: none;
    }
  }
}
</style>

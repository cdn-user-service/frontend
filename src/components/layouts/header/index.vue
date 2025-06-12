<template>
  <el-header
    class="ants-header-box flex items-center justify-between"
    :class="'ants-header-' + layoutTheme.headerTheme"
  >
    <div class="flex items-center" style="height: 100%">
      <transition name="logo" v-if="device === 'pc'">
        <Logo v-if="showLogo" :theme-mode="layoutTheme.headerTheme" />
      </transition>

      <div
        v-else
        class="icon-toggle aicon flex items-center"
        @click="toggleMobileAsideShow(true)"
      >
        <el-icon size="20px"><Expand /></el-icon>
      </div>

      <template v-if="appName.indexOf('dns') != -1">
        <AntsTopBar />
      </template>

      <template v-if="appName.indexOf('cdn') != -1">
        <AntsTopBarNew v-if="appName === 'cdn_admin'" />
      </template>
    </div>

    <div class="flex">
      <AntsActions />
      <AntsAvatar />
    </div>
  </el-header>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

const appName = process.env.VUE_APP_NAME

export default {
  name: 'AntsHeader',
  props: {
    showLogo: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      appName
    }
  },
  computed: {
    ...mapState(['layoutTheme', 'device'])
  },
  methods: {
    ...mapMutations(['toggleMobileAsideShow'])
  }
}
</script>

<style lang="scss">
@use '../../../assets/css/variables.scss' as *;
@use '../../../assets/css/layout.scss' as *;

.ants-header-box {
  height: $headerHeight;
  // box-shadow: 0 2px 0px rgba(0, 0, 0, .05);
  .ants-home-search {
    .el-input__inner {
      border-radius: 17px;
      line-height: 34px;
      height: 34px;
      width: 300px;
      padding-left: 30px;
    }
    .el-input__prefix {
      left: 5px;
      top: 1px;
    }
    .el-input__inner:focus {
      border-color: theme('colors.primary');
    }
  }

  .icon-toggle {
    width: 40px;
    height: 100%;
  }
}

.ants-header-light {
  background-color: $light-bgc-1;
  color: $light-font-1;
  border-bottom: 1px solid $light-border-1;
  .ants-home-search {
    .el-input__inner {
      border: 1px solid $light-bgc-2;
      background-color: $light-bgc-2;
    }
    .el-input__inner:focus {
      background-color: $light-bgc-1;
    }
  }

  .ants-actions-box {
    .action-item {
      span {
        color: $light-font-1;
      }
      &:hover {
        background-color: $light-bgc-2;
      }
    }
  }

  .ants-avatar-box {
    color: $light-font-1;
  }
}

.ants-header-dark {
  background-color: $dark-bgc-1;
  color: $dark-font-1;
  border-bottom: 1px solid $dark-border-1;

  .ants-home-search {
    .el-input__inner {
      border: 1px solid $dark-border-1;
      background-color: $dark-bgc-2;
    }
    .el-input__inner:focus {
      background-color: $dark-bgc-1;
    }
  }

  .ants-actions-box {
    .action-item {
      span {
        color: $dark-font-1;
      }
      &:hover {
        background-color: $dark-bgc-2;
      }
    }
  }

  .ants-avatar-box {
    color: $dark-font-1;
  }
}
</style>

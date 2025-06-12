<template>
  <div class="ants-actions-box flex items-center">
    <template v-for="item in actionList">
      <transition name="logo" :key="item.name">
        <div
          v-if="headerActionItem[item.name]"
          class="action-item flex justify-center items-center"
          @click="doAction(item.name)"
        >
          <el-badge v-if="item.showBadge" :value="unreadCount" :max="99">
            <span :class="item.icon"></span>
          </el-badge>

          <FullScreen v-else-if="item.name === 'showFullScreen'" />

          <Language v-else-if="item.name === 'showI18n'" />

          <span :class="item.icon" v-else></span>
        </div>
      </transition>
    </template>

    <MessageDrawer ref="messageDrawerRef" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

const actionList = [
  {
    key: '锁屏',
    name: 'showLockScreen',
    icon: 'el-icon-lock'
  },
  // {
  //   key: '帮助',
  //   name: 'showHelp',
  //   icon: 'aicon icon-bangzhu1'
  // },
  {
    key: '全屏',
    name: 'showFullScreen',
    icon: 'aicon icon-quanping3'
  },
  {
    key: '消息',
    name: 'showMessage',
    icon: 'aicon icon-ziyuan',
    showBadge: true
  },
  {
    key: '刷新',
    name: 'showRefresh',
    icon: 'el-icon-refresh'
  },
  {
    key: '国际化',
    name: 'showI18n',
    icon: 'el-icon-s-help'
  }
]
export default {
  name: 'AntsActions',
  data() {
    return {
      actionList
    }
  },
  computed: {
    ...mapState(['headerActionItem']),
    ...mapGetters('message', ['unreadCount'])
  },
  created() {},
  methods: {
    doAction(name) {
      this[name]()
    },

    // 锁屏
    showLockScreen() {},

    // 前往帮助文档
    showHelp() {
      window.open('/docs/zh/', '_blank')
    },

    // 全屏
    showFullScreen() {},

    // 打开站内信抽屉
    showMessage() {
      this.$refs.messageDrawerRef.showDrawer = true
    },

    // 点击刷新
    showRefresh() {
      const { path, query } = this.$route
      this.$router.replace({
        path: '/redirect' + path,
        query: query
      })
    },

    // 国际化
    showI18n() {}
  }
}
</script>

<style lang="scss">
.ants-actions-box {
  padding-right: 10px;
  .action-item {
    height: 40px;
    width: 40px;
    margin-right: 5px;
    font-size: 17px;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      span {
        color: theme('colors.primary') !important;
      }
    }
  }
  .el-badge__content {
    border: none;
    color: #fefefe;
  }
}
</style>

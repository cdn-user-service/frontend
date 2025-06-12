<template>
  <el-drawer
    title="消息通知"
    :visible.sync="showDrawer"
    direction="rtl"
    :modal-append-to-body="false"
    size="450px"
    custom-class="message-drawer-box"
  >
    <template slot="title">
      <span class="font-semibold text-ants-text-1">{{
        antsT(admin ? '发布公告' : '消息通知')
      }}</span>
      <span
        v-if="url"
        @click="goMore()"
        class="fr cursor-pointer text-primary"
        >{{ antsT(admin ? '消息管理' : '查看更多') }}</span
      >
    </template>

    <div v-loading="loading">
      <el-empty :description="antsT('暂无数据')" v-if="!messageList.length">
      </el-empty>

      <ul v-else class="border-t border-ants-border-3">
        <li
          v-for="item in messageList"
          :key="item.id"
          @click="goMessageDetail(item)"
          class="message-item relative px-xl py-sm border-b border-dashed border-ants-border-2 cursor-pointer text-ants-text-1 hover:bg-ants-bg-5"
        >
          <span
            v-if="!admin && !item.readStatus"
            class="absolute bg-primary rounded-full"
            style="padding: 3px; top: 16px; left: 20px"
          ></span>

          <span
            v-if="!admin && !item.readStatus"
            @click.stop="doReadMessage(item)"
            class="read-button hidden absolute bg-ants-bg-5 text-primary cursor-pointer rounded-lg"
            style="padding: 2px 5px; top: 10px; right: 24px; font-size: 12px"
            >{{ antsT('标记已读') }}</span
          >

          <div
            class="pb-sm truncate text-sm"
            :class="
              !item.readStatus
                ? 'font-semibold text-ants-text-1'
                : 'text-ants-text-2'
            "
          >
            {{ item.title }}
          </div>
          <div class="text-sm flex items-center justify-between">
            <el-tag size="mini" :type="(typeObj[item.type] || {}).type">{{
              antsT((typeObj[item.type] || {}).text)
            }}</el-tag>
            <span
              :class="{ 'text-ants-text-4': item.readStatus }"
              style="font-size: 12px"
              >{{ item.createtime }}</span
            >
          </div>
        </li>
      </ul>
    </div>

    <!-- 详情对话框 -->
    <MessageDialog
      ref="MessageDialogRef"
      :title="admin ? '公告详情' : '消息详情'"
    />
  </el-drawer>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

const PROCESS_NAME = process.env.VUE_APP_NAME

const typeObj = {
  1: {
    text: '站内信',
    type: 'primary'
  },
  2: {
    text: '公告',
    type: 'success'
  },
  3: {
    text: '工单',
    type: 'info'
  }
}

export default {
  name: 'MessageDrawer',
  components: {},
  data() {
    return {
      admin: PROCESS_NAME.indexOf('admin') != -1,
      showDrawer: false,
      typeObj
    }
  },
  computed: {
    // ...mapState('message', {
    //   messageList: state => state.messageList,
    //   unreadCount: state => state.unreadCount
    // })
    ...mapGetters('message', ['messageList', 'unreadCount', 'loading', 'url'])
  },
  created() {
    this.getMessageList()
  },
  methods: {
    ...mapActions('message', ['getMessageList', 'readMessage']),

    // 查看更多
    goMore() {
      if (this.url) {
        this.$router.push(this.url)
        this.showDrawer = false
      }
    },

    // 查看消息详情
    async goMessageDetail(item = {}) {
      // 设置为已读
      this.doReadMessage(item)
      // 打开消息详情抽屉
      this.$refs.MessageDialogRef.show(item)
    },

    // 标记为已读
    async doReadMessage(item = {}) {
      if (!item.readStatus) {
        this.readMessage(item.id)
        item.readStatus = 1
      }
    }
  }
}
</script>

<style lang="scss">
.message-drawer-box {
  .el-drawer__header {
    padding: 17px 20px;
    margin-bottom: 0;
  }

  .el-dialog__close {
    font-size: 12px;
    padding: 5px;
    margin-top: -3px;
    margin-left: 6px;
    vertical-align: middle;
    border-radius: 12px;
    color: theme('colors.ants-bg-1');
    background-color: theme('colors.ants-text-1');
  }

  .message-item {
    &:hover {
      .read-button {
        display: block;
      }
    }
  }
}
</style>

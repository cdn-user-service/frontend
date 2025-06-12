<template>
  <el-card class="message-detail content-box animated fadeIn">
    <div style="max-width: 900px;" class="mx-auto">
      <div class="flex justify-between">
        <div>
          <el-button
            size="small"
            :type="preDisabled ? 'info' : 'primary'"
            :disabled="preDisabled || loading || btnLoading"
            @click="changePage()"
            ><i class="el-icon-arrow-left el-icon--left" />
            {{ antsT('上一封') }}</el-button
          >
          <el-button
            size="small"
            :type="nextDisabled ? 'info' : 'primary'"
            :disabled="nextDisabled || loading || btnLoading"
            @click="changePage(true)"
            >{{ antsT('下一封') }}<i class="el-icon-arrow-right el-icon--right"
          /></el-button>
        </div>

        <ants-button
          :disabled="!messageDetail.id"
          :loading="loading || btnLoading"
          icon="el-icon-delete"
          size="small"
          type="info"
          @click="doDel()"
          text="删除"
        />
      </div>

      <div class="message-content" v-loading="loading">
        <div class="flex justify-between mb-df -mt-sm">
          <span class="font-semibold text-primary">
            {{ $root.webName }}
          </span>

          <span>{{ messageDetail.createtime }}</span>
        </div>
        <div class="message-content-wrap">
          <div class="font-semibold text-xl mb-lg">
            {{ messageDetail.title }}
          </div>
          <div class="ql-container ql-snow">
            <div class="ql-editor">
              <div v-html="messageDetail.content"></div>
            </div>
          </div>
        </div>

        <ul class="message-footer">
          <li>
            <el-image :src="logoImgDark" fit="contain" />
          </li>
          <!-- <li style="font-size:13px;">
                关注{{ $root.webName }}公众号，掌握最新动态
              </li> -->
          <li>
            Copyright © {{ new Date().getFullYear() }} {{ $root.webName }} All
            Rights Reserved
          </li>
        </ul>
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
// api
import { getItem, doDelete } from '@/v2/dns_users/api/dns/message'

export default {
  data() {
    return {
      loading: false,
      btnLoading: false,
      messageDetail: {
        id: this.$route.query.id
      }
    }
  },
  computed: {
    logoImgDark({ $root }) {
      return $root.webConfig.basic.logoImgDark
    },
    ...mapGetters('message', ['messageList']),
    // 构造消息目录
    messageCatalog() {
      return this.messageList.map(it => it.id)
    },
    // 禁用上一页按钮
    preDisabled() {
      const { id } = this.messageDetail
      if (!this.messageCatalog.length) return true
      if (id == this.messageCatalog[0]) return true
      return false
    },
    // 禁用下一页按钮
    nextDisabled() {
      const { id } = this.messageDetail
      const len = this.messageCatalog.length
      if (!len) return true
      if (id == this.messageCatalog[len - 1]) return true
      return false
    }
  },
  created() {
    this.getMessageDetail()
  },
  mounted() {},
  methods: {
    ...mapActions('message', ['getMessageList']),

    // 发起请求获取消息数据
    async getMessageDetail(id) {
      this.loading = true
      try {
        const { data: res } = await getItem({
          id: id || this.messageDetail.id
        })
        if (res.code !== 1) return
        this.messageDetail = res.data || {}

        // 如果消息未读状态，则刷新消息列表数据
        const readItem = this.messageList[
          this.messageCatalog.indexOf(this.messageDetail.id)
        ]
        if (readItem && !readItem.readStatus) {
          this.getMessageList()
        }
      } finally {
        this.loading = false
      }
    },

    // 点击上一封、下一封 ;  当为第一封时 上一封按钮禁用，当为最后一封时，下一封按钮禁用
    changePage(isNext = false) {
      const idx = this.messageCatalog.indexOf(this.messageDetail.id)

      const newIdx = isNext ? idx + 1 : idx - 1
      const newId = this.messageCatalog[newIdx]
      if (!newId) return

      this.$router.replace({ query: { id: newId } })
      this.getMessageDetail(newId)
    },

    // 点击删除
    async doDel() {
      const { id, title } = this.messageDetail
      const result = await this.$doDelete({
        name: title,
        tag: '消息'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await doDelete({
          ids: id
        })

        if (res.code !== 1) return
        this.$msg.success('删除成功')
        // 更新全局消息列表
        this.getMessageList()

        // 删除成功，若有下一封则当前路由跳转到下一封的路由，
        if (!this.nextDisabled) {
          this.changePage(true)
          return
        }

        if (!this.preDisabled) {
          this.changePage(false)
          return
        }

        // 若都没有则跳转到消息列表路由
        this.$router.replace('./list')
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.message-content {
  margin: 20px 0 30px;
  padding: 30px;
  background-color: theme('colors.ants-bg-2');
  border-radius: 10px;
  .message-content-wrap {
    min-height: 300px;
    background-color: #fff;
    border-top: 3px solid theme('colors.primary');
    padding: 30px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
}

.message-footer {
  padding: 20px;
  > li {
    text-align: center;
    color: theme('colors.ants-text-4');
    font-size: 12px;
    margin-top: 15px;
    .el-image {
      width: 150px;
      height: 50px;
      // box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>

<style lang="scss">
.message-detail {
  .ql-container.ql-snow {
    min-height: 300px;
    border-color: #ebeef5;
    border-radius: 10px;
  }
}
</style>

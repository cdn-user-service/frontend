<template>
  <ants-dialog
    title="数据推送状态"
    v-model="dialogVisible"
    ref="dialogRef"
    width="800px"
    destroy-on-close
    top="5vh"
    append-to-body
  >
    <div v-if="!Object.keys(preheatFeed.feed).length">
      <el-empty description="没有任何可预热更新的配置"></el-empty>
    </div>
    <div v-else>
      <!-- <ul class="space-y-3">
          <li v-for="(value, key) in preheatFeed.feed" :key="key">
            <strong class="mr-sm">{{ key }}</strong>
            <el-tag size="small" effect="dark" :type="statusObj[value].type">
              {{ statusObj[value].text }}
            </el-tag>
          </li>
        </ul> -->
      <div>
        <el-tag
          v-for="(value, key) in preheatFeed.feed"
          :key="key"
          class="mr-sm mb-sm"
          size="medium"
          effect="dark"
          :type="statusObj[value].type"
        >
          【{{ key }}】{{ statusObj[value].text }}
        </el-tag>
      </div>

      <div class="mt-lg">
        <el-collapse>
          <el-collapse-item>
            <template slot="title">
              <span class="text-primary">查看推送详情</span>
              <i class="ml-sm text-primary el-icon-info"></i>
            </template>
            <ul class="space-y-5">
              <li
                v-for="(value, key) in preheatFeed.data_push"
                :key="key"
                class="text-sm text-ants-text-3"
                style=""
              >
                <strong>{{ key }}：</strong> {{ value }}
              </li>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <template slot="footer">
      <ants-button
        type="info"
        size="small"
        @click="dialogVisible = false"
        text="关 闭"
      />
      <ants-button
        size="small"
        type="success"
        @click="refreshPreheatData"
        :loading="loading"
        text="刷新"
      />
    </template>
  </ants-dialog>
</template>

<script>
export default {
  props: {
    loading: Boolean
  },
  data() {
    return {
      dialogVisible: false,
      // 查询index, 用于刷新
      idx: 0,
      preheatFeed: {
        // feed，状态OBJ
        feed: {},
        // 反馈详情
        data_push: {}
      },
      statusObj: {
        success: {
          type: 'success',
          text: '推送成功'
        },
        wait: {
          type: 'warning',
          text: '正在推送'
        },
        danger: {
          type: 'danger',
          text: '推送失败'
        }
      }
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} data
     * @param {*} idx
     */

    showDialog(data = {}, idx = 0) {
      this.preheatFeed = data
      this.idx = idx
      this.dialogVisible = true
    },

    /**
     * @description: 点击刷新
     * @return {*}
     */

    refreshPreheatData() {
      this.$emit('refreshData', this.idx)
    }
  }
}
</script>

<template>
  <div>
    <ants-table
      :data="newTableData"
      @getTableData="getTableData"
      @selection-change="handleSelectionChange"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column
        type="selection"
        width="45"
        align="center"
      ></ants-table-column>

      <ants-table-column label="编号" prop="idx" min-width="60">
      </ants-table-column>

      <ants-table-column prop="id" label="ID" min-width="60">
      </ants-table-column>

      <ants-table-column label="处置方式" prop="mode" min-width="200">
        <template #default="{ row }">
          <div v-if="typeof row.waf_op === 'object'">
            <div v-if="wafOpObj[(row.waf_op || {}).key]">
              <el-tag size="mini" :type="wafOpObj[row.waf_op.key].tag">{{
                antsT(wafOpObj[row.waf_op.key].title)
              }}</el-tag>
              【{{ antsT(wafOpObj[row.waf_op.key].name) }}
              <strong v-if="wafOpObj[row.waf_op.key].type == 'auto'">
                {{ row.waf_op.param }}
                {{ antsT(wafOpObj[row.waf_op.key].unit) }}</strong
              >】
            </div>
          </div>
        </template>
      </ants-table-column>

      <ants-table-column label="匹配规则" prop="rule" min-width="300">
        <template #default="{ row }">
          <ul class="space-y-2" v-if="isAdmin || row.pvalue1 != 1">
            <li v-for="(item, idx) in row.rule" :key="idx">
              <el-tag type="primary" size="mini">
                {{ antsT((typeObj[item.type] || {}).name) }}
              </el-tag>
              【{{ antsT(handleObj[item.handle]) }}】

              <span v-if="typeof item.content === 'object'">
                <span v-for="(contentItem, key) in item.content" :key="key">
                  【{{ key.toUpperCase() }}
                  {{ antsT(handleObj[contentItem.handle]) }}
                  {{ contentItem.value }} ‱】
                </span>
              </span>
              <span v-else>
                {{ item.content }}
              </span>
            </li>
          </ul>

          <span v-else>-</span>
        </template>
      </ants-table-column>

      <ants-table-column label="触发模式" prop="req_sum_5s" min-width="100">
        <template #default="{ row }">
          {{ !row.req_sum_5s ? '持久' : `> ${row.req_sum_5s} 次` }}
        </template>
      </ants-table-column>

      <ants-table-column
        label="备注信息"
        prop="remark"
        min-width="140"
      ></ants-table-column>

      <!-- <ants-table-column prop="updateTime" label="更新时间" min-width="140">
      </ants-table-column> -->

      <ants-table-column label="来源" min-width="100">
        <template #default="{ row }">
          <el-tag type="info" size="mini" v-if="row.pvalue1 == 1">
            自动规则
          </el-tag>
          <el-tag type="primary" size="mini" v-else> 自定义 </el-tag>
        </template>
      </ants-table-column>

      <ants-table-column width="120" label="优先级">
        <template #default="{ row }">
          <div
            class="space-x-2"
            v-loading="weightLoading"
            element-loading-spinner="el-icon-loading"
          >
            <span
              class="el-icon-upload2 text-2xl cursor-pointer hover:text-primary"
              @click="changeWeight(row.id, 0)"
            ></span>
            <span
              class="el-icon-top text-2xl cursor-pointer hover:text-primary"
              @click="changeWeight(row.id, 1)"
            ></span>
            <span
              class="el-icon-bottom text-2xl cursor-pointer hover:text-primary"
              @click="changeWeight(row.id, -1)"
            ></span>
            <span
              class="el-icon-download text-2xl cursor-pointer hover:text-primary"
              @click="changeWeight(row.id, -999999)"
            ></span>
          </div>
        </template>
      </ants-table-column>

      <ants-table-column prop="status" label="启用" width="100">
        <template #default="{ row, $index }">
          <ants-table-switch
            v-model="row.status"
            :disabled="isDisabled || $root.disabledCrud"
            :ref="`tableSwitchRef${$index}`"
            @change="changeStatus(row, `tableSwitchRef${$index}`)"
          >
          </ants-table-switch>
        </template>
      </ants-table-column>

      <ants-table-column
        label="操作"
        width="150"
        auto-fixed
        v-if="!$root.disabledCrud"
      >
        <template #default="{ row }">
          <!-- <ants-button
            v-if="row.pvalue1 == 1"
            size="mini"
            type="info"
            disabled
            text="修改"
          />
          <ants-button
            v-else
            size="mini"
            :type="isDisabled ? 'info' : 'primary'"
            :disabled="isDisabled || btnLoading"
            @click="showCreateUpdateDialog(row)"
            text="修改"
          /> -->
          <ants-button
            size="mini"
            type="primary"
            @click="showCreateUpdateDialog(row)"
            text="修改"
          />

          <ants-button
            size="mini"
            :type="isDisabled ? 'info' : 'danger'"
            :disabled="isDisabled || btnLoading"
            @click="singleDelete(row)"
            text="删除"
          />
        </template>
      </ants-table-column>
    </ants-table>

    <!-- 添加、修改规则对话框 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from '../CreateUpdateDialog'

import { handleObj, typeObj, wafOpObj } from '../rule-name'

export default {
  components: {
    CreateUpdateDialog
  },
  props: {
    // 是否禁止操作
    isDisabled: Boolean
    //
  },
  data() {
    return {
      isAdmin: process.env.VUE_APP_NAME == 'cdn_admin',
      total: 0,
      queryInfo: {
        name: '',
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      // 表格数据
      tableData: [],
      // 勾选数据
      selectArr: [],
      // 按钮加载
      btnLoading: false,
      // 排序按钮加载
      weightLoading: false,

      // 操作逻辑显示
      handleObj,
      // 匹配规则显示
      typeObj,
      // 处置方式显示
      wafOpObj
    }
  },
  computed: {
    // 设置表格编号，已关闭的则不进行排序
    newTableData() {
      let idx = 0
      return this.tableData.map((item) => {
        if (item.status) idx++
        return {
          ...item,
          idx: item.status ? idx : '-'
        }
      })
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      console.log()
      this.$emit('getTableData')
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    // 添加、修改对话框展示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    // 权重修改
    async changeWeight(id, val) {
      console.log('this.$listeners.changeWeight', this.$listeners)
      if (this.isDisabled || this.$root.disabledCrud) return
      this.weightLoading = true
      try {
        const data = await this.$listeners.changeWeight({
          id,
          val
        })
        console.log(data)

        // 刷新表格
        if (data) this.getTableData()
      } finally {
        this.weightLoading = false
      }
    },

    // 状态改变
    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用规则',
          content: '此操作将禁用该规则，是否继续？'
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      try {
        const data = await this.$listeners.changeStatus({
          id: row.id,
          status: row.status
        })

        if (!data) {
          row.status = row.status ? 0 : 1
          return
        }
        this.getTableData()
      } finally {
        this.$refs[switchRef].loading = false
      }
    },

    // 单个删除
    async singleDelete({ id }) {
      const data = await this.$listeners.singleDelete(id)
      if (!data) return
      this.getTableData()
    }
  }
}
</script>

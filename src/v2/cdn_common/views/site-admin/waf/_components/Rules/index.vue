<template>
  <div>
    <ants-form-card>
      <template slot="title">
        自定义精准访问规则
      </template>
      <template slot="info">
        <div>
          策略优先级按照排列顺序由上向下，禁用规则后，本规则不生效。最新增加的规则默认排序最靠前。
        </div>
        <div v-if="pri_precise_waf_selects != 0" class="mt-sm">
          <el-alert :closable="false" type="error" show-icon>
            <template slot="title">
              <div class="flex justify-between items-center">
                <span>
                  重要提示：配置规则后您需要选择应用自定义规则，否则自定义规则将不会生效。
                </span>
                <ants-button
                  type="danger"
                  size="mini"
                  plain
                  @click="$router.push('./application-secure')"
                  text="前往配置"
                />
              </div>
            </template>
          </el-alert>
          <!-- <div>
            请跳转至
            <router-link to="application-secure">应用安全</router-link>
            进行选择自定义配置。
          </div> -->
        </div>
      </template>
      <template slot="content">
        <ul class="space-y-8">
          <li>
            <ants-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              :disabled="$root.loading || pri_precise_waf_selects != 0"
              text="添加规则"
              @click="showCreateUpdateDialog()"
            />
            <!-- <ants-button
              type="info"
              size="small"
              icon="el-icon-delete"
              :disabled="$root.loading"
              :loading="btnLoading"
              @click="batchDelete"
              text="批量删除"
            /> -->
          </li>

          <li>
            <ants-table
              :data="tableData"
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

              <ants-table-column prop="id" label="ID" min-width="60">
              </ants-table-column>
              <ants-table-column label="处置方式" prop="mode" min-width="200">
                <template #default="{ row }">
                  <div v-if="typeof row.waf_op === 'object'">
                    <el-tag size="mini" :type="modeObj[row.waf_op.key].tag">{{
                      modeObj[row.waf_op.key].title
                    }}</el-tag>
                    【{{ modeObj[row.waf_op.key].name }}
                    <strong v-if="modeObj[row.waf_op.key].type == 'auto'">
                      {{ row.waf_op.param }}
                      {{ modeObj[row.waf_op.key].unit }}</strong
                    >】
                  </div>
                </template>
              </ants-table-column>

              <ants-table-column label="匹配规则" prop="rule" min-width="300">
                <template #default="{ row }">
                  <ul class="space-y-2">
                    <li v-for="(item, idx) in row.rule" :key="idx">
                      <el-tag type="primary" size="mini">
                        {{ typeObj[item.type].name }}
                      </el-tag>
                      【{{ handleObj[item.handle] }}】

                      <span v-if="typeof item.content === 'object'">
                        <span
                          v-for="(contentItem, key) in item.content"
                          :key="key"
                        >
                          【{{ key }} {{ handleObj[contentItem.handle] }}
                          {{ contentItem.value }} ‱】
                        </span>
                      </span>
                      <span v-else>
                        {{ item.content }}
                      </span>
                    </li>
                  </ul>
                </template>
              </ants-table-column>

              <ants-table-column
                label="备注信息"
                prop="remark"
                min-width="140"
              ></ants-table-column>

              <ants-table-column
                prop="update_time"
                label="更新时间"
                min-width="140"
              >
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
                    <!-- <span
                      class="el-icon-download text-2xl cursor-pointer hover:text-primary"
                    ></span> -->
                  </div>
                </template>
              </ants-table-column>

              <el-table-column prop="status" label="启用" min-width="80">
                <template #default="{ row, $index }">
                  <ants-table-switch
                    v-model="row.status"
                    :ref="`tableSwitchRef${$index}`"
                    @change="changeStatus(row, `tableSwitchRef${$index}`)"
                  >
                  </ants-table-switch>
                </template>
              </el-table-column>

              <ants-table-column label="操作" width="150" auto-fixed>
                <template #default="{ row }">
                  <ants-button
                    size="mini"
                    type="primary"
                    :disabled="btnLoading || pri_precise_waf_selects != 0"
                    @click="showCreateUpdateDialog(row)"
                    text="修改"
                  />
                  <ants-button
                    size="mini"
                    type="danger"
                    :disabled="btnLoading || pri_precise_waf_selects != 0"
                    @click="singleDelete(row)"
                    text="删除"
                  />
                </template>
              </ants-table-column>
            </ants-table>
          </li>
        </ul>
      </template>
    </ants-form-card>

    <!-- 添加、修改规则对话框 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './components/CreateUpdateDialog'

import {
  handleObj,
  typeObj
} from '@/v2/cdn_common/components/WafRule/rule-name'

const modeObj = {
  forbid_return_code: {
    title: '拦截',
    name: '自定义错误码',
    type: 'auto',
    tag: 'danger'
  },
  forbid_forbid_request: {
    title: '拦截',
    name: '禁封时长',
    type: 'auto',
    unit: '秒',
    tag: 'danger'
  },
  forbid_nfx_block_one: {
    title: '拦截',
    name: '单节点拉黑',
    tag: 'danger'
  },
  forbid_nfx_block_all: {
    title: '拦截',
    name: '全节点拉黑',
    tag: 'danger'
  },
  forbid_pass_log: {
    title: '拦截',
    name: '记录日志后放行',
    tag: 'danger'
  },
  verify_auto_reload: {
    title: '可疑',
    name: '无感验证',
    tag: 'warning'
  },
  verify_click_num: {
    title: '可疑',
    name: '点击数字验证',
    tag: 'warning'
  },
  suspicious_pass_log: {
    title: '可疑',
    name: '记录日志后放行',
    tag: 'warning'
  },
  ignore: {
    title: '忽略',
    name: '指向下一个规则',
    tag: 'info'
  },
  pass: {
    title: '放行',
    name: '直接放行',
    tag: 'success'
  }
}

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      queryInfo: {
        name: '',
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      selectArr: [],
      btnLoading: false,
      weightLoading: false,

      handleObj,
      typeObj,

      modeObj,

      // 当前选中的规则，用来判断是否提示用户
      pri_precise_waf_selects: 0
    }
  },
  computed: {
    total() {
      return this.tableData.length
    }
  },
  created() {
    this.getSelectWaf()
  },
  methods: {
    getTableData() {},

    /**
     * @description: 获取当前选中的规则是否为自定义
     */

    async getSelectWaf() {
      const { data: res } = await this.$listeners.getSiteDetail(
        '',
        'pri_precise_waf_selects'
      )
      res.attr.forEach(item => {
        if (item.pkey === 'pri_precise_waf_selects') {
          this.pri_precise_waf_selects = +item.pvalue

          if (item.pvalue != 0) {
            this.$alert(
              '您需要前往选择自定义规则，否则自定义规则将不会生效！',
              '重要提示',
              {
                confirmButtonText: '前往配置',
                type: 'info',
                center: true,
                callback: action => {
                  this.$router.push('./application-secure')
                }
              }
            )
          }
        }
      })
    },

    /**
     * @description: 单个保存
     * @param {*} key
     */

    doSave(key = '') {
      this.saveSiteAttr({
        [key]: this.form[key]
      })
    },

    /**
     * @description: 保存配置数据
     */

    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 添加、修改对话框展示
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 权重修改
     */

    async changeWeight(id, val) {
      this.weightLoading = true
      const data = await this.$listeners.changeSiteAttrWeight(
        'pri_precise_waf_details',
        id,
        val
      )
      this.weightLoading = false

      if (data) this.$emit('refreshData')
    },

    /**
     * @description: 状态改变
     * @param {*} row
     */

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
      const data = await this.$listeners.changeSiteAttrStatus({
        pkey: 'pri_precise_waf_details',
        attrId: row.id,
        status: row.status
      })
      this.$refs[switchRef].loading = false

      if (!data) {
        row.status = row.status ? 0 : 1
      }
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const idsArr = this.selectArr.map(e => {
        return e.id
      })
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete({ id }) {
      const res = await this.$listeners.deleteSiteAttr(
        'pri_precise_waf_details',
        id
      )
      if (res) this.$emit('refreshData')
    }
  }
}
</script>

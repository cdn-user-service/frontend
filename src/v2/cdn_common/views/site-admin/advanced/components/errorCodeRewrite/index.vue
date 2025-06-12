<template>
  <div>
    <ants-form-card>
      <template slot="title">{{ antsT('状态码改写') }}</template>
      <template slot="info">
        {{ antsT('支持您自定义状态码信息') }}
      </template>
      <template slot="content">
        <ul class="space-y-8">
          <li class="flex justify-between items-center">
            <ants-switch
              v-model="form.error_code_rewrite_switch"
              active-text="ON"
              inactive-text="OFF"
              v-loading="$attrs.btnLoading"
              @change="changeStatus"
            />
            <ants-button
              v-if="!$root.disabledCrud"
              size="mini"
              type="primary"
              icon="el-icon-plus"
              :disabled="$attrs.btnLoading"
              @click="showCreateUpdateDialog()"
              text="添加"
            />
          </li>

          <li>
            <el-table
              :data="tableData"
              border
              size="small"
              v-loading="$root.loading"
            >
              <ants-table-column
                label="状态码"
                prop="errorCode"
                min-width="140"
                align="center"
              >
              </ants-table-column>
              <ants-table-column
                label="改写状态码"
                prop="rewriteCode"
                min-width="300"
                align="center"
              >
              </ants-table-column>

              <ants-table-column
                label="参数"
                prop="rewriteParam"
                min-width="140"
                align="center"
              >
              </ants-table-column>

              <ants-table-column
                label="操作"
                width="160"
                align="center"
                v-if="!$root.disabledCrud"
              >
                <template #default="{ row }">
                  <ants-button
                    size="mini"
                    type="primary"
                    @click="showCreateUpdateDialog(row)"
                    text="编辑"
                  />
                  <ants-button
                    size="mini"
                    type="danger"
                    @click="deleteSingle(row)"
                    text="删除"
                  />
                </template>
              </ants-table-column>
            </el-table>
          </li>
        </ul>
      </template>
    </ants-form-card>

    <!-- 添加修改缓存对话框 -->
    <createUpdateDialog
      ref="createUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
      :tableData="tableData"
    />
  </div>
</template>

<script>
import createUpdateDialog from './createUpdate'
export default {
  components: {
    createUpdateDialog
  },
  data() {
    return {
      form: {
        error_code_rewrite_switch: 0,
        // 状态码改写
        error_code_rewrite: ''
      },
      tableData: []
    }
  },

  methods: {
    // 对话框显示
    showCreateUpdateDialog(row = {}) {
      this.$refs.createUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 状态 开关
     * @param {*} val
     */

    async changeStatus(val) {
      const res = await this.$listeners.changeSiteAttrStatus({
        pkey: 'error_code_rewrite',
        status: val
      })
      // 复位
      if (!res) {
        val = val ? 0 : 1
      }
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteSingle({ id }) {
      const res = await this.$listeners.deleteSiteAttr('error_code_rewrite', id)
      if (res) this.$emit('refreshData')
    }
  }
}
</script>

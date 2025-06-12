<template>
  <div>
    <ants-form-card>
      <template slot="title">{{ antsT('自定义HTTP响应头') }}</template>
      <template slot="info">
        {{ antsT('支持您自定义 HTTP 响应头中的 header 信息') }}
      </template>
      <template slot="content">
        <ul class="space-y-8">
          <li class="flex justify-between items-center">
            <ants-switch
              v-model="form.add_header_swtich"
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
                label="Header类型"
                prop="header"
                min-width="140"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag size="mini" v-if="row.type === 'custom'"
                    >{{ antsT('自定义') }}
                  </el-tag>
                  {{ row.header }}
                </template>
              </ants-table-column>
              <ants-table-column
                label="匹配内容"
                prop="content"
                min-width="300"
                align="center"
              >
              </ants-table-column>

              <ants-table-column
                label="备注信息"
                prop="info"
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

        <Clear
          ref="ClearRef"
          v-on="$listeners"
          v-bind="$attrs"
          :clear-table="clearTable"
        />
      </template>
    </ants-form-card>

    <!-- 添加修改缓存对话框 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'

import Clear from './clear'
export default {
  components: {
    CreateUpdateDialog,
    Clear
  },
  data() {
    return {
      form: {
        add_header_swtich: 1,
        // 自定义HTTP响应头, [mm_text]
        add_header: ''
      },
      tableData: [],

      // 多余响应头表格数据
      clearTable: []
    }
  },
  methods: {
    // 对话框显示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 状态 开关
     * @param {*} val
     */

    async changeStatus(val) {
      const res = await this.$listeners.changeSiteAttrStatus({
        pkey: 'add_header',
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
      const res = await this.$listeners.deleteSiteAttr('add_header', id)
      if (res) this.$emit('refreshData')
    }
  }
}
</script>

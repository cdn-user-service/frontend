<template>
  <div>
    <ants-form-card>
      <template slot="title">{{ antsT('站内重定向') }}</template>
      <template slot="info">
        {{ antsT('自定义站内重定向规则') }}
      </template>
      <template slot="content">
        <ul class="space-y-8">
          <li class="flex justify-between items-center">
            <ants-switch
              v-model="status"
              active-text="ON"
              inactive-text="OFF"
              v-loading="$attrs.btnLoading"
              @change="changeStatus"
              :disabled="$root.disabledCrud"
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
              <ants-table-column label="ID" prop="id" width="100">
              </ants-table-column>
              <ants-table-column
                label="入站地址"
                prop="path"
                min-width="200"
                align="center"
              >
              </ants-table-column>
              <ants-table-column
                label="重定向地址"
                prop="rewritePath"
                min-width="200"
                align="center"
              >
              </ants-table-column>
              <ants-table-column
                label="跳转方式"
                prop="rewriteMode"
                min-width="140"
                align="center"
              >
                <template #default="{row}">
                  {{ modeObj[row.rewriteMode] || '' }}
                </template>
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
    />
  </div>
</template>

<script>
import createUpdateDialog from './createUpdate'

const modeObj = {
  permanent: '301 转移永久跳转',
  redirect: '302 转移临时跳转',
  last: '内部跳转'
}

export default {
  components: {
    createUpdateDialog
  },
  data() {
    return {
      status: 0,
      tableData: [],
      modeObj
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
        pkey: 'site_uri_rewrite',
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
      const res = await this.$listeners.deleteSiteAttr('site_uri_rewrite', id)
      if (res) this.$emit('refreshData')
    }
  }
}
</script>

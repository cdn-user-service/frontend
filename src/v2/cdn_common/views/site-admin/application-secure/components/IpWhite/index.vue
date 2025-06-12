<template>
  <div>
    <ants-form-card>
      <template slot="title">{{ antsT('IP白名单') }}</template>
      <!-- <template slot="info">
          {{ antsT('Server白名单') }}
        </template> -->
      <template slot="content">
        <ul class="space-y-8">
          <li class="flex justify-between items-center" v-if="!$root.disabledCrud">
            <!-- <ants-switch
              v-model="form.server_waf_white_ip_switch"
              active-text="ON"
              inactive-text="OFF"
              v-loading="$attrs.btnLoading"
              @change="changeStatus"
            /> -->
            <ants-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              :disabled="$attrs.btnLoading"
              @click="showCreateUpdateDialog()"
              text="添加白名单"
            />
          </li>

          <li>
            <el-table
              :data="tableData"
              border
              size="mini"
              v-loading="$root.loading"
              max-height="400px"
            >
              <ants-table-column label="IP地址" prop="ip" min-width="150">
              </ants-table-column>
              <ants-table-column label="备注信息" prop="remark" min-width="300">
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

    <createUpdateDialog
      ref="createUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getTableData"
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
        server_waf_white_ip_switch: 0,
        // Sever白名单, [mm_text]
        server_waf_white_ip: ''
      },
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    async getTableData() {
      const { data: res } = await this.$listeners.getSiteDetail(
        '',
        'server_waf_white_ip'
      )
      if (!res.attr.length) return
      const arr = []
      res.attr.forEach(item => {
        const obj = item.pvalue && JSON.parse(item.pvalue)
        // id 用于编辑和删除
        obj.id = item.id
        arr.unshift(obj)
      })
      this.tableData = arr
    },

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
        pkey: 'server_waf_white_ip',
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
      const res = await this.$listeners.deleteSiteAttr(
        'server_waf_white_ip',
        id
      )
      if (res) this.getTableData()
    }
  }
}
</script>

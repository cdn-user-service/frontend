<template>
  <div>
    <ants-form-card style="margin: 0;">
      <template slot="title">
        <div class="flex justify-between">
          <span> {{ antsT('别名管理') }}{{ `【${tableData.length}】` }} </span>

          <ants-button
            style="margin-bottom:-12px;"
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="showCreateUpdateDialog"
            text="添加别名"
            v-if="!$root.disabledCrud"
          />
        </div>
      </template>

      <template slot="content">
        <el-table
          style="margin:0;"
          :data="tableData"
          v-loading="$root.loading"
          size="mini"
          height="240"
        >
          <ants-table-column width="100" prop="id" label="ID">
          </ants-table-column>
          <ants-table-column min-width="150" prop="value" label="别名">
          </ants-table-column>

          <ants-table-column width="60" prop="ssl" label="SSL" align="center">
            <template #default="{ row }">
              <i
                class="text-df"
                :class="
                  sslDomains.includes(row.value)
                    ? 'el-icon-success text-success'
                    : 'el-icon-error text-error'
                "
              />
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
      </template>
    </ants-form-card>

    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'
export default {
  components: {
    CreateUpdateDialog
  },
  props: {
    sslDomains: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tableData: []
    }
  },
  methods: {
    /**
     * @description: 显示添加源站对话框
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteSingle({ id }) {
      const res = await this.$listeners.deleteSiteAttr('alias', id)
      if (res) this.$emit('refresh')
    }
  }
}
</script>

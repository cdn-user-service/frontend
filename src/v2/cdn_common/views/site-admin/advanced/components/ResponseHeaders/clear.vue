<template>
  <div class="mt-xl">
    <ul class="space-y-8">
      <li class="flex justify-between">
        <TitleBorder title="多余HTTP响应头" />

        <ants-button
          v-if="!$root.disabledCrud"
          size="mini"
          type="info"
          icon="el-icon-plus"
          :disabled="$attrs.btnLoading"
          @click="showClearCreateDialog()"
          text="添加多余响应头"
        />
      </li>

      <li>
        <el-table
          :data="clearTable"
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
                @click="showUpdateDialog(row)"
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

    <!-- 清除HTTP响应头对话框，添加 -->
    <ClearCreateDialog
      ref="ClearCreateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
    />

    <!-- 编辑 -->
    <ClearUpdateDialog
      ref="ClearUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import ClearCreateDialog from './clearCreateDialog'
import ClearUpdateDialog from './clearUpdateDialog'

export default {
  components: {
    ClearCreateDialog,
    ClearUpdateDialog
  },
  props: {
    clearTable: Array
  },
  data() {
    return {}
  },
  methods: {
    // 对话框显示
    showUpdateDialog(row = {}) {
      this.$refs.ClearUpdateDialogRef.showDialog(row)
    },

    // 点击清除 相应头
    showClearCreateDialog() {
      this.$refs.ClearCreateDialogRef.showDialog()
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteSingle({ id }) {
      const res = await this.$listeners.deleteSiteAttr('more_clear_headers', id)
      this.$listeners.refreshData()
    }
  }
}
</script>

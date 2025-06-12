<template>
  <div class="line-basic-box">
    <el-card class="content-box animated fadeIn">
      <ants-radio-group
        v-model="queryInfo.group_id"
        size="small"
        @change="changeType"
        class="mb-lg"
      >
        <ants-radio-button
          v-for="(item, idx) in typeList"
          :key="idx"
          :label="idx"
          :text="item"
        />
      </ants-radio-group>
      <table-query-form
        :search-arr="[
          {
            name: '检索区域名称',
            key: 'name',
            value: queryInfo.name
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="showCreateDialog"
            text="添加数据"
          />
        </template>

        <template slot="inputs">
          <el-select
            v-model="queryInfo.parentId"
            size="small"
            clearable
            filterable
            placeholder="检索父级"
            style="margin-right:10px;"
            @change="changeUsers"
            v-if="queryInfo.group_id != 1 && queryInfo.group_id != 8"
          >
            <el-option
              v-for="item in parentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </template>
      </table-query-form>

      <ants-table
        :data="baseAreaList"
        @getTableData="getGoodsList"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          type="selection"
          width="45"
          align="center"
          key="0"
        ></ants-table-column>

        <ants-table-column label="区域名称" key="1" prop="name" min-width="140">
        </ants-table-column>

        <ants-table-column
          key="3"
          label="省份"
          prop="parent_name"
          min-width="140"
          v-if="queryInfo.group_id == 8"
        >
        </ants-table-column>

        <ants-table-column key="2" label="编码" prop="code" min-width="140">
        </ants-table-column>

        <ants-table-column key="10" label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="showUpdateDialog(row)"
              :disabled="btnLoading"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加对话框弹窗 -->
    <CreateDialog
      ref="CreateDialogRef"
      :parentList="parentList"
      :queryInfo="queryInfo"
    />

    <!-- 自然划分区添加对话框弹窗 -->
    <CreateZoneDialog ref="CreateZoneDialogRef" :parentList="parentList" />

    <!-- 修改线路对话框弹窗 -->
    <UpdateDialog ref="UpdateDialogRef" />
  </div>
</template>

<script>
import BaseAreaListJs from '../js/basic-area'
import CreateDialog from './CreateDialog.vue'
import CreateZoneDialog from './CreateZoneDialog.vue'
import UpdateDialog from './UpdateDialog.vue'

export default {
  components: {
    CreateDialog,
    CreateZoneDialog,
    UpdateDialog
  },
  data() {
    return {
      alldoList: {
        ids: [],
        page: '',
        limit: ''
      }, // 批量删除提交数据

      // 添加区域数据
      btnLoading: false,

      ...BaseAreaListJs.data
    }
  },
  created() {
    this.getTypeList()
    this.getGoodsList()
    // 如果当前分类不为大洲，发起请求父级数据
    if (this.queryInfo.group_id != 1) {
      this.getParentList()
    }
  },
  methods: {
    ...BaseAreaListJs.methods,

    /**
     *  点击添加数据，获取父级列表数据，打开对话框
     */
    async showCreateDialog() {
      // 如果为自然划分区
      if (this.queryInfo.group_id == 8) {
        this.$refs.CreateZoneDialogRef.showDialog()
      } else {
        this.$refs.CreateDialogRef.showDialog()
      }
    },

    // 点击修改线路，传递数据，打开修改对话框
    showUpdateDialog(row = {}) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    // 批量操作选中值发生变化
    async selectChange(val) {
      
    },

    // 批量删除
    async batchDelete() {
      this.alldoList.page = this.queryInfo.page
      this.alldoList.limit = this.queryInfo.limit

      const { data } = await this.$http.post(
        '',
        this.$qs.stringify(this.alldoList)
      )
      console.log(data)

      if (data.code !== 1) return

      this.$msg.success('批量删除成功')
      this.getGoodsList()
    },

    /**
     *  删除线路模块
     */
    // 点击删除
    async singleDelete(row) {
      const result = await this.$doDelete({
        name: row.domain,
        tag: '数据'
      })
      if (!result) return
      this.btnLoading = true
      const { data } = await this.$http.post(
        '',
        this.$qs.stringify({
          id: row.id,
          type: this.queryInfo.group_id
        })
      )
      this.btnLoading = false

      if (data.code !== 1) return

      this.$msg.success('已成功删除数据：' + row.name)
      this.getGoodsList()
    }
  },
  beforeDestroy() {
    window.sessionStorage.removeItem('areaType')
  }
}
</script>

<style lang="scss" scoped>
.wei_bread_box {
  display: flex;
  align-items: center;
  // padding: 20px 20px 0 20px;
  line-height: 30px;
  .bread_title {
    color: theme('colors.ants-text-1') 1;
    font-size: 18px;
    font-weight: 700;
    margin-right: 20px;
    display: inline-block;
    padding-right: 20px;
    border-right: 1px solid rgba(0, 0, 0, 0.08);
  }
  .el-breadcrumb {
    margin: 0;
  }
}
</style>

<style lang="scss">
.line-basic-box {
  .code_table {
    .cell {
      line-height: 16px;
    }
  }

  .add_d_info {
    margin: 0;
    color: theme('colors.ants-text-4');
    font-size: 12px;
  }
  .add_dailog {
    .el-dialog--center .el-dialog__body {
      padding: 10px 60px 30px;
    }
  }
  .edit_dailog {
    .el-dialog--center .el-dialog__body {
      padding: 20px 25px;
    }
    .el-form-item__label {
      padding-right: 20px;
    }
  }

  .wei_bread_box {
    .el-breadcrumb {
      .el-breadcrumb__inner {
        color: theme('colors.ants-text-3') !important;
        font-weight: 700 !important;
      }
    }
  }
}
.cascader_box {
  .el-cascader-panel {
    height: 300px;
  }
}
</style>

<template>
  <div class="line-list-box">
    <div class="content-box animated fadeIn">
      <!-- <div class="info_box">
        <span class="el-icon-info"></span>
        注意：线路层级最多划分为四个层级：第一级 > 第二级 > 第三级 > 第四级，请根据自己的需求设置每级内容。
      </div> -->
      <div class="wei_bread_box animated fadeIn pl-lg">
        <span class="bread_title">{{ levelName }}</span>
        <el-breadcrumb separator=">" v-show="navpathLength">
          <el-breadcrumb-item v-for="item in navpath" :key="item.id">
            <span class="cursor" @click="changeUsers(item.parent)">{{
              item.name
            }}</span></el-breadcrumb-item
          >
          <el-breadcrumb-item>{{ levelName }}列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入线路名称搜索',
            key: 'name',
            value: queryInfo.name
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList(queryInfo.parent)"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-arrow-left"
            v-if="navpathLength"
            @click="changeUsers(navpath[navpathLength - 1].parent)"
            text="上一级"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="showCreateDialog()"
            text="添加线路"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            @click="batchDelete"
            :loading="$root.loading"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="lineList"
        @getTableData="getGoodsList(queryInfo.parent)"
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

        <ants-table-column
          key="2"
          v-if="navpathLength >= 1"
          label="第一级"
          min-width="100"
        >
          <template slot>
            <span class="cursor" @click="changeUsers(navpath[0].parent)">{{
              navpath[0].name
            }}</span>
          </template>
        </ants-table-column>
        <ants-table-column
          key="3"
          v-if="navpathLength >= 2"
          label="第二级"
          min-width="100"
        >
          <template slot>
            <span class="cursor" @click="changeUsers(navpath[1].parent)">{{
              navpath[1].name
            }}</span>
          </template>
        </ants-table-column>
        <ants-table-column
          key="4"
          v-if="navpathLength >= 3"
          label="第三级"
          min-width="100"
        >
          <template slot>
            <span class="cursor" @click="changeUsers(navpath[2].parent)">{{
              navpath[2].name
            }}</span>
          </template>
        </ants-table-column>
        <ants-table-column
          key="5"
          v-if="navpathLength >= 4"
          label="第四级"
          min-width="100"
        >
          <template slot>
            <span class="cursor" @click="changeUsers(navpath[3].parent)">{{
              navpath[3].name
            }}</span>
          </template>
        </ants-table-column>

        <ants-table-column
          :label="levelName"
          key="1"
          min-width="100"
          prop="name"
        >
        </ants-table-column>

        <ants-table-column
          key="6"
          label="编码段"
          prop="startEnd"
          min-width="140"
          class-name="code_table"
        >
          <template #default="{ row }">
            <div v-html="row.startEnd.replace(/\|/g, '<br>')"></div>
          </template>
        </ants-table-column>

        <ants-table-column
          key="7"
          label="查看子线路"
          v-if="navpathLength < 3"
          min-width="100"
        >
          <template #default="{ row }">
            <span class="cursor-color text-primary" @click="changeUsers(row.id)"
              >查看（ {{ row.child || 0 }} ）</span
            >
          </template>
        </ants-table-column>

        <ants-table-column key="9" label="排序" prop="order" min-width="80">
          <template slot="header">
            <span>排序</span>
            <el-tooltip
              class="item"
              effect="dark"
              content="数值越小越靠前"
              placement="top"
            >
              <span
                class="el-icon-info text-primary ml-1 cursor-pointer"
              ></span>
            </el-tooltip>
          </template>
        </ants-table-column>
        <ants-table-column key="10" label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="showUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="deleteInfo(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加对话框弹窗 -->
    <CreateDialog
      ref="CreateDialogRef"
      :parent="queryInfo.parent"
      @getTableData="getTableData"
    />

    <!-- 修改线路对话框弹窗 -->
    <UpdateDialog ref="UpdateDialogRef" @getTableData="getTableData" />
  </div>
</template>

<script>
import CreateDialog from './CreateDialog.vue'
import UpdateDialog from './UpdateDialog.vue'
// api
import {
  getLineList,
  doDeleteLine
} from '@/v2/dns_admin/api/dns/line'

export default {
  components: {
    CreateDialog,
    UpdateDialog
  },
  data() {
    return {
      levelName: '第一级', // 当前级别名称

      total: 0,
      queryInfo: {
        parent: '', // 父ID
        name: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: 30 // 当前每页显示多少条数据
      },

      lineList: [],
      selectValue: '', // 批量操作绑定值
      navpath: [], // 当前路径数据
      navpathLength: 0, // 当前有多少级

      selectArr: [], // 批量删除提交数据

      // 添加区域数据
      btnLoading: false
    }
  },
  created() {
    this.getGoodsList(window.sessionStorage.getItem('lineParent') || 0)
  },
  methods: {
    /**
     * @description: 获取线路数据
     * @param {*} parent
     * @param {*} level
     */

    async getGoodsList(parent) {
      this.$root.loading = true
      // parent 为父ID
      this.queryInfo.parent = parent
      const { data: res } = await getLineList(this.queryInfo)
      this.$root.loading = false

      if (res.code !== 1) return

      this.lineList = res.data.list || []
      this.total = res.data.totalCount || 0

      // 当前层级关系
      this.navpath = res.nav_path.reverse() || []
      this.navpathLength = this.navpath.length

      // 将 parent,level 存入本地，用于用户手动刷新查询数据
      window.sessionStorage.setItem('lineParent', parent)

      // 根据 level 判断当前页文本
      switch (this.navpathLength) {
        case 1:
          this.levelName = '第二级'
          break
        case 2:
          this.levelName = '第三级'
          break
        case 3:
          this.levelName = '第四级'
          break
        case 4:
          this.levelName = '第五级'
          break
        default:
          this.levelName = '第一级'
      }
    },

    getTableData() {
      this.getGoodsList(this.queryInfo.parent)
    },

    // 检索
    changeUsers(parent) {
      // 检索重置分页到第一页
      this.queryInfo.name = this.queryInfo.name.trim()
      this.queryInfo.page = 1
      this.getGoodsList(parent)
    },

    // 列表勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    // 批量操作选中值发生变化
    async selectChange(val) {},

    // 添加线路
    showCreateDialog() {
      this.$refs.CreateDialogRef.showDialog()
    },

    /**
     *  修改线路模块
     */
    // 点击修改线路，传递数据，打开修改对话框
    showUpdateDialog(row = {}) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 批量删除线路
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '线路'
      })
      if (!result) return

      this.$root.loading = true
      const ids = this.selectArr.map(item => {
        return item.id
      })

      const { data: res } = await doDeleteLine({
        ids: ids + ''
      })

      this.$root.loading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(`已成功删除 ${selectLength} 条线路`)

      this.selectArr = []
    },

    /**
     * @description: 单个删除线路
     * @param {*} row
     */

    async deleteInfo(row) {
      const result = await this.$doDelete({
        name: row.name,
        tag: '线路'
      })
      if (!result) return

      const { data: res } = await doDeleteLine({
        ids: row.id + ''
      })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除线路成功')
    }
  },
  beforeDestroy() {
    // 清除 sessionStorage
    window.sessionStorage.removeItem('lineParent')
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
    color: theme('colors.ants-text-1');
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
.line-list-box {
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

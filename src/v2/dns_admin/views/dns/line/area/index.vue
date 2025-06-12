<template>
  <div class="line-area-box">
    <div class="content-box">
      <div class="ants-tips_box">
        <span class="el-icon-info"></span>
        注意：区域设置分为五个层级：第一级 > 第二级 > 第三级 > 第四级 >
        第五级，请根据自己的需求设置每级内容。
      </div>
      <div class="wei_bread_box animated fadeIn">
        <span class="bread_title">{{ levelName }}</span>
        <el-breadcrumb separator=">" v-show="navpathLength">
          <el-breadcrumb-item v-for="item in navpath" :key="item.id">
            <span class="cursor" @click="changeAreaName(item.parent)">{{
              item.name
            }}</span></el-breadcrumb-item
          >
          <el-breadcrumb-item>{{ levelName }}列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <el-card class="content-box animated fadeIn">
      <table-query-form>
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-arrow-left"
            v-if="navpathLength"
            :disabled="$root.loading"
            @click="changeAreaName(navpath[navpathLength - 1].parent)"
            text="上一级"
          />

          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="showCreateDialog"
            text="添加区域"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="batchDelete"
            text="批量删除"
          />
        </template>
        <template slot="inputs">
          <el-input
            class="ants-search_input mr-sm"
            style="width:220px;"
            placeholder="输入名称搜索"
            clearable
            v-model="queryInfoArea.name"
            size="small"
            @change="changeAreaName(queryInfoArea.parent)"
          >
            <i
              slot="prefix"
              class="el-input__icon aicon icon-sousuo"
              @click="changeAreaName(queryInfoArea.parent)"
            ></i>
          </el-input>
        </template>
      </table-query-form>

      <ants-table
        :data="areaList"
        @getTableData="getAreaList(queryInfoArea.parent)"
        :total="totalArea"
        :queryInfo="queryInfoArea"
        row-key="id"
        @selection-change="handleSelectionChangeArea"
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
            <span
              class="cursor-color"
              @click="changeAreaName(navpath[0].parent)"
              >{{ navpath[0].name }}</span
            >
          </template>
        </ants-table-column>
        <ants-table-column
          key="3"
          v-if="navpathLength >= 2"
          label="第二级"
          min-width="100"
        >
          <template slot>
            <span
              class="cursor-color"
              @click="changeAreaName(navpath[1].parent)"
              >{{ navpath[1].name }}</span
            >
          </template>
        </ants-table-column>
        <ants-table-column
          key="4"
          v-if="navpathLength >= 3"
          label="第三级"
          min-width="100"
        >
          <template slot>
            <span
              class="cursor-color"
              @click="changeAreaName(navpath[2].parent)"
              >{{ navpath[2].name }}</span
            >
          </template>
        </ants-table-column>
        <ants-table-column
          key="5"
          v-if="navpathLength >= 4"
          label="第四级"
          min-width="100"
        >
          <template slot>
            <span
              class="cursor-color"
              @click="changeAreaName(navpath[3].parent)"
              >{{ navpath[3].name }}</span
            >
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
          :label="`${levelName}编码`"
          prop="code"
          min-width="140"
        >
          <template #default="{ row }">
            <span>{{ row.code }}</span>
          </template>
        </ants-table-column>

        <ants-table-column
          key="7"
          label="查看下级"
          v-if="navpathLength < 4"
          min-width="100"
        >
          <template #default="{ row }">
            <span
              class="cursor-color text-primary"
              @click="changeAreaName(row.id)"
              >查看（ {{ row.child || 0 }} ）</span
            >
          </template>
        </ants-table-column>

        <ants-table-column
          key="8"
          label="区域描述"
          prop="info"
          show-overflow-tooltip
          min-width="120"
        >
          <template #default="{ row }">
            {{ row.info || '--' }}
          </template>
        </ants-table-column>

        <ants-table-column key="9" label="排序" prop="weight" min-width="80">
          <template slot="header">
            <span>排序</span>
            <el-tooltip
              class="item"
              effect="dark"
              content="数值越小越靠前"
              placement="top"
            >
              <span class="el-icon-info ants-icon_info"></span>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            {{ row.weight || '--' }}
          </template>
        </ants-table-column>
        <ants-table-column key="10" label="操作" width="210">
          <template #default="{ row }">
            <ants-button
              type="success"
              size="mini"
              @click="showAppendDialog(row)"
              text="追加"
            ></ants-button>
            <ants-button
              type="primary"
              size="mini"
              @click="showUpdateDialog(row)"
              text="修改"
            ></ants-button>
            <ants-button
              type="danger"
              size="mini"
              @click="deleteInfo(row)"
              text="删除"
            ></ants-button>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加对话框弹窗 -->
    <CreateDialog
      ref="CreateDialogRef"
      :levelName="levelName"
      :navpathLength="navpathLength"
      :parent="queryInfoArea.parent"
      @getTableData="getTableData"
    />

    <!-- 修改对话框弹窗 -->
    <UpdateDialog ref="UpdateDialogRef" @getTableData="getTableData" />

    <!-- 追加IP段对话框弹窗 -->
    <AppendDialog ref="AppendDialogRef" @getTableData="getTableData"/>
  </div>
</template>

<script>
import CreateDialog from './CreateDialog.vue'
import UpdateDialog from './UpdateDialog.vue'
import AppendDialog from './AppendDialog.vue'

// api
import {
  getAclAreaList,
  doDeleteArea
} from '@/v2/dns_admin/api/dns/line'

export default {
  components: {
    CreateDialog,
    UpdateDialog,
    AppendDialog
  },
  data() {
    return {
      levelName: '第一级', // 当前级别名称

      totalArea: 0,
      queryInfoArea: {
        parent: '', // 父ID
        name: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: 30 // 当前每页显示多少条数据
      },
      areaList: [],
      navpath: [], // 当前路径数据
      navpathLength: 0, // 当前有多少级

      selectArr: [], // 批量删除提交数据

      btnLoading: false
    }
  },
  created() {
    this.getAreaList(window.sessionStorage.getItem('parent') || 0)
  },
  methods: {
    /**
     * @description: 获取区域数据
     * @param {*} parent
     * @param {*} level
     */

    async getAreaList(parent) {
      // parent 为父ID
      this.$root.loading = true
      this.queryInfoArea.parent = parent
      const { data: res } = await getAclAreaList(this.queryInfoArea)

      this.$root.loading = false

      if (res.code !== 1) return

      this.areaList = res.data.list || []
      this.totalArea = res.data.totalCount || 0

      // 当前层级关系
      this.navpath = res.nav_path.reverse() || []
      this.navpathLength = this.navpath.length

      // 将 parent,level 存入本地，用于用户手动刷新查询数据
      window.sessionStorage.setItem('parent', parent)

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

    // 检索
    changeAreaName(parent) {
      // 检索重置分页到第一页
      this.queryInfoArea.name = this.queryInfoArea.name.trim()
      this.queryInfoArea.page = 1
      this.getAreaList(parent)
    },

    // 级联选择器自定义搜索
    cascadeFilter(node, keyword) {
      if (node.label === keyword) {
        return true
      }
    },

    // 勾选操作
    handleSelectionChangeArea(val) {
      this.selectArr = val || []
    },

    // 点击添加区域
    showCreateDialog() {
      this.$refs.CreateDialogRef.showDialog()
    },

    // 刷新表格数据
    getTableData() {
      this.getAreaList(this.queryInfoArea.parent)
    },

    // 修改区域
    showUpdateDialog(row = {}) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 追加IP段显示
     */

    showAppendDialog(row = {}) {
      this.$refs.AppendDialogRef.showDialog(row)
    },

    /**
     * @description: 批量删除区域
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '区域'
      })
      if (!result) return

      const idsArr = this.selectArr.map(e => e.id)
      this.btnLoading = true
      const { data: res } = await doDeleteArea({
        ids: idsArr.toString()
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个区域')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteInfo(row) {
      const result = await this.$doDelete({
        name: row.name,
        tag: '区域'
      })
      if (!result) return

      const { data } = await doDeleteArea({
        ids: row.id + ''
      })
      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除区域：' + row.title)
    },

    // 监听limit 改变事件
    handleSizeChangeArea(newSize) {
      this.queryInfoArea.limit = newSize
      this.getTableData()
    },

    // 监听 页码值 改变事件
    handleCurrentChangeArea(newPage) {
      this.queryInfoArea.page = newPage
      this.getTableData()
    }
  },
  beforeDestroy() {
    // 清除 sessionStorage
    window.sessionStorage.removeItem('parent')
    window.sessionStorage.removeItem('level')

    window.sessionStorage.removeItem('areaType')
  }
}
</script>

<style lang="scss">
.line-area-box {
  .add_d_info {
    margin: 0;
    color: theme('colors.ants-text-4');
    font-size: 12px;
  }

  .wei_bread_box {
    display: flex;
    align-items: center;
    padding: 20px 20px 0 20px;
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

<template>
  <div class="dataP_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入参数名称搜索',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            icon="el-icon-refresh"
            size="small"
            text="刷新"
            @click="getTableData()"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          type="selection"
          min-width="60"
          align="center"
          key="0"
        ></ants-table-column>
        <ants-table-column
          prop="id"
          label="ID"
          width="50"
        > </ants-table-column>

        <ants-table-column
          prop="attrKeyName"
          label="参数名称"
          min-width="130"
        >
        </ants-table-column>
        <ants-table-column
          prop="attrValue"
          label="默认值"
          min-width="100"
        >
          <template #default="{row}">
            <span
              v-if="row.attrType == 'bool'"
              class="el-icon-success text-success"
            >
              支持</span>
            <span v-else>
              <span class="font-semibold">{{ row.attrValue }}</span>
              {{ row.attrUnit }}</span>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="attrPrice"
          label="价格"
          min-width="120"
        >
          <template #default="{row}">
            <span class="price_color">{{ row.attrPrice | priceFormat }}</span>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="attrKeyWeight"
          label="排序"
          min-width="100"
        >
        </ants-table-column>

        <ants-table-column
          prop="attrGroupName"
          label="所属分组"
          min-width="100"
        >
          <template #default="{row}">
            {{ row.attrGroupName || '--' }}
          </template>
        </ants-table-column>

        <ants-table-column
          prop="status"
          label="启用"
          width="100"
        >
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#F52443"
              :ref="`tableSwitchRef${$index}`"
              @change="toggleStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column
          label="操作"
          width="100"
        >
          <template #default="{row}">
            <ants-button
              size="mini"
              type="primary"
              @click="toEdit(row)"
              text="修改"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加、修改参数抽屉：TODO:这个不用，现在不允许修改其他的参数，以免造成数据错乱 -->
    <el-drawer
      :title="titleText + '参数'"
      :visible.sync="addDialogVisible"
      direction="rtl"
      custom-class="drawer_form"
      :size="500"
      @close="resetForm"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="90px"
        status-icon
        label-position="top"
      >
        <el-form-item
          label="所属分组（选填）："
          prop="attrGroupName"
        >
          <el-input
            v-model="addForm.attrGroupName"
            placeholder="请输入所属分组（选填）"
            maxlength="50"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="参数名称："
          prop="attrKeyName"
        >
          <el-input
            v-model="addForm.attrKeyName"
            placeholder="请输入参数名称"
            maxlength="50"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="参 数 值："
          prop="attrType"
          style="margin-bottom:10px;"
        >
          <el-radio-group v-model="addForm.attrType">
            <el-radio label="int">数值</el-radio>
            <el-radio label="bool">布尔值</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label=""
          prop="attrValue"
          v-if="addForm.attrType === 'int'"
        >
          <el-input-number
            v-model="addForm.attrValue"
            :step="1"
            :min="1"
            :precision="0"
            placeholder="请输入参数值"
            @change="changeValue"
          ></el-input-number>
          <el-input
            v-model="addForm.attrUnit"
            placeholder="单位"
            style="width:100px;"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="价 格："
          prop="attrPrice"
        >
          <el-input-number
            v-model="addForm.attrPrice"
            :step="100"
            :min="0"
            :precision="2"
            placeholder="请输入价格"
          ></el-input-number>
          <span class="text-sm ants-font-4">{{ $root.priceUnit }}</span>
        </el-form-item>

        <el-form-item
          label="排 序："
          required
          prop="attrKeyWeight"
        >
          <el-input-number
            v-model="addForm.attrKeyWeight"
            :step="1"
            :min="1"
            :precision="0"
            placeholder="请输入排序"
          ></el-input-number>
          <span class="text-sm ants-font-4">(越大越靠前)</span>
        </el-form-item>

        <el-form-item
          label="是否可叠加："
          required
          prop="attrSuperposition"
        >
          <el-radio-group v-model="addForm.attrSuperposition">
            <el-radio :label="1">可叠加</el-radio>
            <el-radio :label="0">不可叠加</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div class="drawer_footer">
        <el-button
          size="small"
          :loading="btnLoading"
          type="primary"
          @click="addAttrSub()"
        >确 定</el-button>
        <el-button
          size="small"
          @click="addDialogVisible = false"
          type="info"
        >取 消</el-button>
      </div>
    </el-drawer>

    <FormDialog ref="FormDialogRef" @refresh="getTableData"/>
  </div>
</template>

<script>
import FormDialog from './FormDialog.vue'

// API
import {
  getAttrList,
  doUpdateAttr,
  doDeleteAttr
} from '@/v2/dns_admin/api/dns/plan'
const defaultForm = {
  // 添加对话框的表单数据
  id: null,
  attrGroupName: '', // 属性分组，选填，不填则为顶级分组
  attrGroupWeight: 1, // 分组排序
  attrKeyName: '', // 属性名
  attrKeyWeight: 1, // 排序
  attrType: 'int', // 属性类型，bool、int
  attrValue: '', // 属性值
  attrUnit: '', // 属性单位
  attrPrice: 0, // 属性价格
  attrSuperposition: 1, // 属性级别 0=套餐内不可叠加 1=套餐内可叠加
  status: 1 // 状态
}

export default {
  components: {
    FormDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],

      // 添加参数数据
      btnLoading: false,
      titleText: '添加',
      addDialogVisible: false, // 添加管理对话框弹窗显示
      defaultForm: {
        ...defaultForm
      },
      addForm: {
        ...defaultForm
      },

      addFormRules: {
        attrKeyName: [
          {
            required: true,
            message: '参数名称不能为空',
            trigger: 'blur'
          }
        ],
        attrType: [
          {
            required: true,
            message: '请选择参数值',
            trigger: 'change'
          }
        ],
        attrPrice: [
          {
            required: true,
            message: '价格不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取参数列表数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getAttrList(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return
      this.total = res.data.totalCount || 0
      this.tableData = res.data.list || []
    },

    toEdit(row = {}) {
      this.$refs.FormDialogRef.show(row)
    },

    // 前往添加-编辑参数
    goAddGoods(row) {
      if (row.id === 'add') {
        // 添加
        this.addForm = this.defaultForm
        this.titleText = '添加'
      } else {
        // 修改
        this.addForm = {
          ...row
        }
        this.addForm.attrPrice = this.addForm.attrPrice / 100
        this.titleText = '修改'
      }
      this.addDialogVisible = true
    },

    /**
     * @description: 添加修改参数提交
     */

    addAttrSub() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true
        const subForm = {
          ...this.addForm
        }
        subForm.attrPrice = subForm.attrPrice * 100 // 价格以分为单位，要乘以100
        const { data: res } = await doUpdateAttr(subForm)

        this.btnLoading = false

        if (res.code !== 1) return

        this.getTableData()
        this.$msg.success(this.titleText + '产品参数成功')
        this.addDialogVisible = false
      })
    },

    // 表单重置
    resetForm() {
      this.$refs.addFormRef.resetFields()
    },

    // 参数值改变
    changeValue(val) {
      if (!val) {
        this.addForm.attrValue = 1
      }
    },

    /**
     * @description: 上架-下架参数
     * @param {*} row
     */

    async toggleStatus(row, switchRef) {
      let txt = '启用'
      if (!row.status) {
        txt = '禁用'
      }
      this.$refs[switchRef].loading = true

      const { data: res } = await doUpdateAttr(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        if (row.status) {
          row.status = 0
        } else {
          row.status = 1
        }
        return
      }

      this.getTableData()
      this.$msg.success(txt + '产品参数成功')
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '参数'
      })
      if (!result) return

      const idsArr = this.selectArr.map((e) => {
        return e.id
      })

      const { data: res } = await doDeleteAttr(idsArr)

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个参数')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除参数
     * @param {*} row
     */

    async deleteGoods(row) {
      const result = await this.$doDelete({
        name: row.attrKeyName,
        tag: '参数'
      })
      if (!result) return

      const { data: res } = await doDeleteAttr([row.id])

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除参数成功')
    }
  }
}
</script>

<style lang="scss">
.dataP_box {
  .dialog_box {
    .el-form-item__label {
      padding-right: 25px;
    }
  }

  .el-dialog__footer {
    padding-bottom: 30px;
  }

  .el-input-number {
    width: 230px;
    margin-right: 20px;
    .el-input {
      width: 230px;
    }
  }
}

.drawer_form {
  .el-drawer__body {
    margin-bottom: 72px;
  }
  .el-drawer__header {
    font-weight: 600;
    color: theme('colors.ants-text-2');
  }

  .el-form {
    padding: 20px;
  }
  .el-form-item__label {
    line-height: 30px;
    font-weight: 600;
    font-size: 13px;
  }

  .drawer_footer {
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    text-align: center;
    background-color: #fff;
    box-shadow: 0px -1px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
<style lang="scss" scoped>
.progress_info {
  margin: 0;
  font-size: 12px;
}
</style>

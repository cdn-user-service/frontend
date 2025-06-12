<template>
  <ants-dialog
    :title="`添加${levelName}`"
    v-model="dialogVisible"
    width="700px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
    top="5vh"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
      label-position="top"
      space-class="space-y-4"
      class="-mt-lg"
    >
      <ants-form-item label="" prop="type">
        <ants-radio-group v-model="form.type" @change="changeAddType">
          <ants-radio label="hand" text="手动添加" />
          <ants-radio label="base" text="批量勾选" />
        </ants-radio-group>
      </ants-form-item>

      <div
        v-if="form.type === 'base'"
        style="padding-top:10px;min-height:300px;"
      >
        <el-radio-group
          v-model="queryInfo.group_id"
          size="small"
          @change="changeType"
        >
          <el-radio-button
            v-for="(item, idx) in typeList"
            :key="idx"
            :label="idx"
            >{{ item }}</el-radio-button
          >
        </el-radio-group>
        <div class="flex items-center justify-between" style="margin-top:20px;">
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

          <el-input
            class="search_input"
            placeholder="检索区域名称"
            clearable
            style="width:200px;"
            v-model="queryInfo.name"
            size="small"
            @change="changeUsers"
          >
            <i
              slot="prefix"
              class="el-input__icon aicon icon-sousuo"
              @click="changeUsers"
            ></i>
          </el-input>
        </div>

        <el-table
          :data="baseAreaList"
          v-loading="$root.loading"
          max-height="450px"
          style="margin-top:10px;"
          size="mini"
          @selection-change="handleSelectionChange"
        >
          <ants-table-column
            type="selection"
            width="50"
            align="center"
            key="0"
          ></ants-table-column>

          <ants-table-column
            label="区域名称"
            key="1"
            prop="name"
            min-width="140"
          >
          </ants-table-column>

          <ants-table-column
            key="3"
            label="省份"
            prop="parent_name"
            min-width="140"
            v-if="queryInfo.group_id == 8"
          >
          </ants-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          small
          :page-sizes="[30, 50, 100, 200]"
          :page-size="queryInfo.limit"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.page"
        >
        </el-pagination>
      </div>

      <div v-else>
        <ants-form-item
          :label="`${levelName}名称`"
          prop="content"
          style="margin-bottom:0px;"
        >
          <ants-input
            v-model="form.content"
            type="textarea"
            :autosize="{ minRows: 12, maxRows: 20 }"
            :placeholder="`请输入${levelName}名称，一行为一个，不允许有空格`"
          />
        </ants-form-item>
        <ants-form-item style="margin-bottom:0px;">
          <div class="text-sm text-ants-text-4">
            注意：一行为一个，不允许有空格。
          </div>
        </ants-form-item>
      </div>
    </ants-form>
  </ants-dialog>
</template>

<script>
import BaseAreaListJs from '../js/basic-area'
// api
import { doCreateArea } from '@/v2/dns_admin/api/dns/line'

const defaultForm = {
  content: '',
  type: 'hand' // hand 为手动添加，base 为选择基础数据添加
}
export default {
  props: {
    levelName: String,
    navpathLength: [String, Number],
    parent: [String, Number]
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        content: [
          {
            required: true,
            message: '名称不能为空',
            trigger: ['change', 'blur']
          }
        ],
        type: [
          {
            required: true,
            message: '请选择添加方式',
            trigger: 'change'
          }
        ]
      },
      // 基础区域数据
      ...BaseAreaListJs.data
    }
  },
  methods: {
    // 基础区域方法
    ...BaseAreaListJs.methods,

    showDialog() {
      this.dialogVisible = true
    },

    /**
     * @description: 添加区域方式切换 ===========================
     * @param {*} val
     */

    changeAddType(val) {
      // 如果选择勾选输入，则请求基础区域数据
      if (val === 'base') {
        // 获取本地数据
        this.queryInfo.group_id = window.sessionStorage.getItem('areaType') || 1
        this.getTypeList()
        this.getGoodsList()
      }
    },

    /**
     * @description: 添加提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        let nameArr = ''

        // 如果为批量勾选添加
        if (this.form.type === 'base') {
          if (!this.selectBaseValue.length) {
            this.$refs.dialogRef.btnLoading = false
            this.$msg.error('请勾选要添加的区域！')
            return
          }
          let areaString = ''
          this.selectBaseValue.map(item => {
            areaString += '|' + item.name
          })
          nameArr = areaString.slice(1)
        } else {
          nameArr = this.form.content.trim().replace(/[\r\n\s]+/g, '|')
        }

        const { data: res } = await doCreateArea({
          parent: this.parent,
          level: this.navpathLength,
          name: nameArr
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$emit('getTableData')
        this.$msg.success('添加区域成功')
        this.dialogVisible = false
      })
    },

    // 表单重置
    resetForm() {
      this.selectBaseValue = []
      this.selectValue = ''
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

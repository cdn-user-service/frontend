<template>
  <ants-dialog
    title="添加线路"
    v-model="dialogVisible"
    width="600px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      label-position="top"
    >
      <ants-form-item label="" prop="mode" style="margin-bottom:10px;">
        <ants-radio-group v-model="form.mode" @change="changeMode">
          <ants-radio :label="1" text="单条添加" />
          <ants-radio :label="2" text="多条添加" />
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item label="线路名称" prop="name">
        <ants-input
          v-model="form.name"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 10 }"
          placeholder="请输入线路名称"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="选择区域" prop="checkids">
        <el-cascader
          v-model="form.checkids"
          :props="props"
          @change="lineHandleChange"
          placeholder="请选择区域"
          :filter-method="cascadeFilter"
          filterable
          clearable
          ref="cascaderRef"
          :show-all-levels="true"
          popper-class="cascader_box"
          style="width:100%;"
        >
          <template slot-scope="{ node, data }">
            <span>{{ data.label }}</span>
            <span v-if="!node.isLeaf">({{ data.child }})</span>
          </template>
        </el-cascader>
      </ants-form-item>

      <ants-form-item label="编码段：" style="margin:0;" v-show="codeList">
        {{ codeList }}
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import {
  getAllAraCodeList,
  doCreateLine
} from '@/v2/dns_admin/api/dns/line'

const defaultForm = {
  mode: 1, // 添加模式
  name: '',
  checkids: [1, 2] // 级联选择器绑定数据
}
export default {
  props: {
    parent: [String, Number]
  },
  data() {
    return {
      dialogVisible: false,
      codeList: '', // 编码段

      form: {
        ...defaultForm
      },
      formRules: {
        name: [
          {
            required: true,
            message: '线路名称不能为空',
            trigger: ['change', 'blur']
          }
        ],
        mode: [
          {
            required: true,
            message: '请选择添加模式',
            trigger: 'change'
          }
        ]
      },

      props: {
        expandTrigger: 'hover',
        checkStrictly: true, // 是否严格的遵守父子节点不互相关联
        emitPath: false, // false-只返回该节点的值,true返回数组
        multiple: true, // 多选
        // value: 'id',
        // label: 'title',

        lazy: true,
        lazyLoad: async (node, resolve) => {
          if (!node.root && node.data.child == 0) {
            node.loading = false
            return
          }

          // 当前节点数据
          const { value, level } = node

          // 请求当前节点 下一级的数据，然后填充
          const { data: res } = await getAllAraCodeList(value)

          if (res.data.length) {
            const allIds = []
            const nodes = res.data.map((e, i) => {
              allIds[i] = e.id
              return {
                value: e.id,
                label: e.name,
                child: e.child,
                leaf: e.child == 0
              }
            })

            // nodes.unshift({
            //     value: allIds,
            //     label: '全部',
            //     child: 0,
            //     leaf: true
            // })
            resolve(nodes)
          }
        }
      }
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
    },

    /**
     * @description: 添加提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { data: res } = await doCreateLine({
          mode: this.form.mode,
          parent: this.parent,
          name: this.form.name,
          checkids: this.form.checkids + '' // 转成字符串
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$emit('getTableData')
        this.$msg.success('添加线路成功')
        this.dialogVisible = false
      })
    },

    // 级联选择器 change 事件
    lineHandleChange(val) {
      this.changeMode(this.form.mode)
    },

     // 根据不同的模式写入不同格式的线路名称
     changeMode(mode) {
      // 将线路名称自动填入
      this.form.name = ''
      // 1、获取已选中的区域
      const nowCascaData = this.$refs.cascaderRef.checkedNodes

      // 2、分两种写入模式， A：单条添加，一行显示；B：多条添加，多行显示
      if (!nowCascaData.length) return
      // console.log(nowCascaData)
      // 多条添加
      if (mode === 2) {
        nowCascaData.forEach((e, idx) => {
          if (e.checked) {
            if (idx === 0) {
              this.form.name = e.label
            } else {
              this.form.name += '\n' + e.label
            }
          }
        })
      }

      // 单条添加
      if (mode === 1) {
        nowCascaData.forEach(e => {
          this.form.name += e.label
        })
      }
    },

    // 级联选择器自定义搜索
    cascadeFilter(node, keyword) {
      if (node.label === keyword) {
        return true
      }
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

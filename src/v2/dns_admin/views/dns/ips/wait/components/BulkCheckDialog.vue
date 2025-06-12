<template>
  <ants-dialog
    title="批量识别Ip段数据"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
    submitBtnText="识 别"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="fromRef"
      label-width="110px"
      label-position="top"
      status-icon
    >
      <ants-form-item label="选择区域" prop="code">
        <el-cascader
          v-model="form.code"
          :props="areaProps"
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
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { getAllAraCodeList } from '@/v2/dns_admin/api/dns/line'
import { doCheckAclIpList } from '@/v2/dns_admin/api/dns/ips'

const defaultForm = {
  code: ''
}

export default {
  props: {
    // 选中的Ip段数据
    selectIpArr: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      btnLoading: false,
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        code: [
          {
            required: true,
            message: '请选择区域',
            trigger: ['change', 'blur']
          }
        ]
      },
      areaProps: {
        expandTrigger: 'hover',
        // 是否严格的遵守父子节点不互相关联
        checkStrictly: true,
        // false-只返回该节点的值,true返回数组
        emitPath: false,
        // 是否多选
        multiple: false,
        // 是否懒加载
        lazy: true,
        // 懒加载数据
        lazyLoad: this.lazyAreaData
      }
    }
  },
  methods: {
    showDialog(row) {
      this.dialogVisible = true
    },

    /**
     * @description: 批量识别Ip段数据提交
     */

    submitForm() {
      this.$refs.fromRef.validate(async valid => {
        if (!valid) return
        if (!this.selectIpArr.length) return this.$msg.error('未选择任何IP段！')
        this.$refs.dialogRef.btnLoading = true

        const idsArr = this.selectIpArr.map(item => item.id)
        const { data: res } = await doCheckAclIpList({
          ids: idsArr + '',
          code: this.form.code
        })
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$emit('refresh')
        this.$msg.success(`已成功识别 ${this.selectIpArr.length} 个IP段`)
        this.dialogVisible = false
      })
    },

    /**
     * @description: 选择区域懒加载数据
     * @param {*} node
     * @param {*} resolve
     */

    async lazyAreaData(node, resolve) {
      // 如果没有子项关闭加载样式
      if (!node.root && node.data.child == 0) {
        node.loading = false
        return
      }

      // 当前节点数据
      const { data, level } = node
      const id = data && data.id

      // 请求当前节点 下一级的数据，然后填充
      const { data: res } = await getAllAraCodeList(id)

      if (res.data.length) {
        const nodes = res.data.map((e, i) => {
          return {
            value: e.code,
            id: e.id,
            label: e.name,
            child: e.child,
            leaf: e.child == 0
          }
        })

        resolve(nodes)
      }
    },

    lineHandleChange(val) {
      // 选择后立即隐藏下拉框
      this.$refs.cascaderRef.dropDownVisible = false
    },

    // 级联选择器自定义搜索
    cascadeFilter(node, keyword) {
      if (node.label === keyword) {
        return true
      }
    },

    // 对话框重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.fromRef.resetFields()
    }
  }
}
</script>

<style lang="less">
.cascader_box {
  .el-cascader-panel {
    height: 300px;
  }
}
</style>

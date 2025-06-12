<template>
  <el-dialog
    :visible.sync="dialogVisible"
    ref="dialogRef"
    title="变更计费方式"
    width="600px"
    center
    append-to-body
  >
    <div class="mb-lg flex items-center" >
      <span class="el-icon-warning text-warning" style="font-size:36px;"></span>
      <strong class="text-3xl ml-sm">变更计费方式后，需要等待生效时间</strong>
    </div>
    <ul class="ants-tips_box space-y-2">
      <li class="font-bold">温馨提示：新计费方式生效前无法取消变更或再次变更！</li>
      <li>
        1、变更为按流量计费方式，新的计费方式次日0点生效；
      </li>
      <li>
        2、变更为按月95计费方式，新的计费方式次月1号0点生效；
      </li>
      <li>
        3、可通过提交工单方式或者 <span class="text-primary cursor-pointer underline">联系我们</span> 进行变更。
      </li>
    </ul>

    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        text="取 消"
        @click="dialogVisible = false"
      />
      <ants-button
        size="small"
        type="primary"
        text="提交工单"
        @click="dialogVisible = false"
      />
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false
    }
  },
  created() {},
  methods: {
    /**
     * @description: 对话框显示
     */

    showDialog(row = {}) {
      this.dialogVisible = true
    },

    /**
     * @description: 提交
     */

    async submitForm() {},

    resetForm() {}
  }
}
</script>

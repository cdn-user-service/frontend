<template>
  <ants-dialog
    :title="`${antsT('域名分组')}【${groupData.name}】`"
    width="700px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <div class="transfer-box flex justify-center" v-loading="loading">
      <el-transfer
        filterable
        :filter-placeholder="antsT('检索域名')"
        v-model="innerData"
        :data="outData"
        :titles="[antsT('组外域名'), antsT('组内域名')]"
        :button-texts="[antsT('移除'), antsT('添加')]"
        :props="{
          key: 'id',
          label: 'domain'
        }"
      >
      </el-transfer>
    </div>
  </ants-dialog>
</template>

<script>
// API
import {
  getDomainGroupDetail,
  // getDomainGroupNotin,
  doCreateUpdateDomainGroup
} from '@/v2/dns_users/api/dns/domain'

export default {
  data() {
    return {
      btnLoading: false,
      loading: false,
      dialogVisible: false,
      outData: [],
      innerData: [],
      groupData: {}
    }
  },
  methods: {
    // 对话框显示
    showDialog(row = {}) {
      this.dialogVisible = true
      this.groupData = {
        ...row
      }
      this.getDetailData()
    },

    /**
     * @description: 获取组外域名
     */

    async getDetailData() {
      this.loading = true
      const { data: res } = await getDomainGroupDetail({
        id: this.groupData.id
      })
      this.loading = false
      if (res.code !== 1) return
      // 全部域名
      const allDomainArr = res.notIn || []
      if (res.data && res.data.domainInfos) {
        allDomainArr.push(...res.data.domainInfos)
      }
      this.outData = allDomainArr

      // 定义组内域名
      if (this.groupData.domainIds) {
        this.innerData = this.groupData.domainIds.split(',').map(item => +item)
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.dialogRef.btnLoading = true
      console.log(this.innerData)
      const { data: res } = await doCreateUpdateDomainGroup({
        ...this.groupData,
        domainIds: this.innerData + ''
      })
      this.$refs.dialogRef.btnLoading = false
      if (res.code !== 1) return
      this.dialogVisible = false
      this.$parent.getTableData()
      this.$msg.success(this.antsT('操作成功'))
    },

    // 表单重置
    resetForm() {
      this.outData = []
      this.innerData = []
      this.loading = this.btnLoading = false
    }
  }
}
</script>

<style lang="scss">
.transfer-box {
  .el-transfer-panel {
    width: 250px;
  }
  .el-transfer-panel__body {
    height: 320px;
  }
  .el-transfer-panel__list.is-filterable {
    height: 268px;
  }
  .el-transfer__buttons {
    padding: 0 20px;
    .el-button {
      display: block;
      margin: 10px 0;
      width: 100%;
      padding: 10px;
      span,
      i {
        font-size: 12px;
      }
    }
  }
}
</style>

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
        :data="allData"
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
  getAllDomain,
  doCreateUpdateDomainGroup
} from '@/v2/cdn_users/api/cdn/site'

export default {
  data() {
    return {
      btnLoading: false,
      loading: false,
      dialogVisible: false,
      allData: [],
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
      this.getAllDomainData()
    },

    // 获取用户的所有域名
    async getAllDomainData() {
      this.loading = true
      try {
        const { data: res } = await getAllDomain({
          igg: 0
        })
        this.loading = false
        if (res.code !== 1) return
        console.log(res)
        const obj = res.data || {}

        // 全部的域名
        const allData = []
        for (const key in obj) {
          allData.push({
            id: key,
            domain: obj[key]
          })
        }
        console.log(this.groupData)
        // 定义组内域名
        let innerSites = []
        if (this.groupData.siteIds) {
          this.innerData = this.groupData.siteIds.split(',')
          console.log(this.innerData)
          innerSites = (this.groupData.siteList || []).map((it) => {
            return {
              id: it.id + '',
              domain: it.mainServerName
            }
          })
          console.log('innerSites', innerSites)
        }
        this.allData = allData.concat(innerSites)
        console.log('allData', this.allData)
      } finally {
        this.loading = false
      }
    },

    // 表单提交
    async submitForm() {
      this.$refs.dialogRef.btnLoading = true
      console.log(this.innerData)
      const { data: res } = await doCreateUpdateDomainGroup({
        ...this.groupData,
        siteIds: this.innerData + ''
      })
      this.$refs.dialogRef.btnLoading = false
      if (res.code !== 1) return
      this.dialogVisible = false
      this.$emit('refresh')
      this.$msg.success(this.antsT('操作成功'))
    },

    // 表单重置
    resetForm() {
      this.allData = []
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

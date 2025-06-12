<template>
  <ants-form-card>
    <template slot="title">
      <TitleBorder title="系统授权信息" />
    </template>
    <template slot="info">
      当前系统的授权信息，若授权过期，请购买授权或联系管理员。
    </template>
    <template slot="content">
      <el-table border :data="[authInfo]" style="margin: 0" v-loading="loading">
        <ants-table-column
          label="产品名称"
          prop="goods"
          min-width="140"
          align="center"
        >
        </ants-table-column>
        <ants-table-column
          label="版本号"
          prop="version"
          min-width="140"
          align="center"
        >
          <template #default="{ row }">
            <el-tag size="mini" type="success">{{ row.version }}</el-tag>
          </template>
        </ants-table-column>
        <ants-table-column
          label="授权 IP"
          prop="ip"
          min-width="140"
          align="center"
        >
        </ants-table-column>
        <ants-table-column
          label="产品识别码"
          prop="goods_code"
          min-width="140"
          align="center"
        >
          <template #default="{ row }">
            <ants-copy :text="row.goods_code" />
          </template>
        </ants-table-column>

        <ants-table-column
          label="节点数"
          prop="access_max"
          min-width="140"
          align="center"
        >
        </ants-table-column>

        <ants-table-column
          label="到期时间"
          prop="endtime"
          min-width="140"
          align="center"
        >
          <template #default="{ row }">
            {{ (row.endtime * 1000) | dateFormat }}
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="success"
              @click="updateAuth(row)"
              text="更新"
            />
            <ants-button
              size="mini"
              type="primary"
              @click="upgradeAuth(row)"
              text="升级"
            />
          </template>
        </ants-table-column>
      </el-table>
    </template>
  </ants-form-card>
</template>

<script>
// API
import { getAuthInfo } from '@/v2/cdn_admin/api/home/auth'
export default {
  data() {
    return {
      loading: false,
      authInfo: {
        // 到期时间
        endtime: 0,
        // 授权IP
        auth_ip: '',
        // 产品名称
        goods: '',
        // 产品识别码
        goods_code: '',
        // 节点数
        access_max: 0,
        // 版本号
        version: '-'
      }
    }
  },
  created() {
    this.getAuthInfoData()
  },
  methods: {
    async getAuthInfoData() {
      this.loading = true
      try {
        const { data: res } = await getAuthInfo()
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data && JSON.parse(res.data)
        if (obj) {
          this.authInfo = {
            ...this.authInfo,
            ...obj
            // auth_ip: '192.168.10.1',
            // access_max: '无限制',
            // endtime: '永久',
            // goods_code: '*****'
          }
        }
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    updateAuth(row) {},
    upgradeAuth(row) {}
  }
}
</script>

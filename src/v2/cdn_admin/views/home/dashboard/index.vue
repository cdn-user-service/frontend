<template>
  <div class="animated fadeIn">
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 18 }"
        :xl="{ span: 18 }"
      >
        <Avatar />

        <CountItem />

        <el-row :gutter="20">
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 12 }"
            :md="{ span: 8 }"
            :lg="{ span: 8 }"
            :xl="{ span: 8 }"
            v-for="item in chartList"
            :key="item"
            class="mt-lg"
          >
            <component
              :is="item"
              :ref="`${item}Ref`"
            />
          </el-col>
        </el-row>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 6 }"
        :xl="{ span: 6 }"
      >
        <AuthInfo />

        <UpdateLog />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getChartData, doUpdateStaticVariable } from '@/v2/cdn_admin/api/public'

import Avatar from './components/Avatar'
import CountItem from './components/CountItem'

import UserLoginBar from './components/UserLoginBar'
import FinanceRose from './components/FinanceRose'
import RightLine from './components/RightLine'

import AuthInfo from './components/AuthInfo'
import UpdateLog from './components/UpdateLog'

import { getLocation } from '@/utils/env'

export default {
  components: {
    Avatar,
    CountItem,

    UserLoginBar,
    FinanceRose,
    RightLine,

    UpdateLog,
    AuthInfo
  },
  data() {
    return {
      // 系统信息
      masterEnvObj: {
        AuthMasterIp: '',
        MasterProtocol: 'http',
        MasterWebPort: 80,
        MasterWebSeverName: '',
        jarVersion: '2.0.0'
      },

      chartList: ['UserLoginBar', 'FinanceRose', 'RightLine']
    }
  },
  created() {
    this.getMasterEnv()
  },
  methods: {
    // 获取系统信息
    async getMasterEnv() {
      const { data: res } = await getChartData({
        keys: 'master_env'
      })
      const obj = (res.data || {}).master_env || {}
      this.masterEnvObj = {
        ...this.masterEnvObj,
        ...obj
      }

      this.updateStaticVariable()
    },

    /**
     * @description: 更新变量，如果检测到本地的 protocol、hostname、port 跟线上的不一致，则要调用这个接口更新
     */
    async updateStaticVariable() {
      const { MasterProtocol, MasterWebSeverName, MasterWebPort } =
        this.masterEnvObj
      // 协议、主机、端口
      const { protocol, hostname, port } = getLocation()
      console.log(MasterProtocol, '-----', protocol)
      console.log(MasterWebSeverName, '-----', hostname)
      console.log(MasterWebPort, '-----', port)

      if (this.debug) return

      // 如果有不相同的则更新一下
      if (`${MasterProtocol}:` != protocol || MasterWebSeverName != hostname) {
        const { data: res } = await doUpdateStaticVariable({
          protocol: protocol.replace(':', ''),
          server: hostname,
          // 端口为空时设置为80
          port: port || 80
        })
      }
    }
  }
}
</script>

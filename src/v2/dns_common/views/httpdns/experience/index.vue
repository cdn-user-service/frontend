<template>
  <div>
    <ul class="ants-tips_box content-box">
      <li>
        <span class="el-icon-info"></span>
        1、通过API接口体验 移动解析 HTTPNDS，请先将被解析的域名添加值
        <router-link to="/dns/httpdns/domain">“域名管理”</router-link>；
      </li>
      <li class="mt-xs">
        <span class="el-icon-info"></span>
        2、HTTPDNS 每个月（按月计算）流量包
        <router-link to="/dns/httpdns/domain">“域名管理”</router-link>；
      </li>
    </ul>

    <el-card class="animated fadeIn content-box">
      <div slot="header">
        <div class="font-semibold">
          移动解析 HTTPDNS 在线体验
        </div>
        <div class="text-sm text-ants-text-4 pt-sm">
          移动解析 HTTPDNS 以 HTTP 协议代替了 DNS 协议，绕开了运营商
          LocalDNS，可以规避各地运营商的解析劫持，并按细分线路提升解析精准度，有效降低资源访问的失败率。
        </div>
      </div>

      <div v-loading="loading">
        <div class="mb-lg flex items-center">
          <DomainPopover @change="changeDomain" />
          <!-- <span
          class="inline-block cursor-color py-xs px-df border border-ants-border-2 rounded-xl"
          style="min-width:220px;max-width:400px;"
        >
          请选择要查询解析的域名
          <i class="el-icon-plus"></i>
        </span> -->
          <ants-button
            type="primary"
            size="small"
            class="ml-sm"
            text="解 析"
            @click="toQuery()"
          />
        </div>

        <div class="p-lg rounded-2xl bg-ants-bg-5 flex" style="font-size:12px;">
          <ul style="width:400px;" class="space-y-lg">
            <li>
              <span>解析域名：</span>
              <span>{{ encryptData.domain }}</span>
            </li>
            <li>
              <span>当前IP：</span>
              <span>{{ encryptData.ip }}</span>
            </li>
            <li>
              <span>当前IP所在地：</span>
              <span>{{ encryptData.ipArea }}</span>
            </li>
          </ul>

          <ul class="flex-1 pl-lg space-y-lg">
            <li>
              <span
                ><i class="el-icon-info"></i>
                域名<strong>DES</strong>加密字符串：</span
              >
              <ants-copy :text="encryptData.httpDes" />
            </li>
            <li>
              <span
                ><i class="el-icon-info"></i>
                域名<strong>AES</strong>加密字符串：</span
              >
              <ants-copy :text="encryptData.httpAes" />
            </li>
            <li class="flex">
              <span><i class="el-icon-info"></i> 测试URL：</span>
              <div class="flex-1">
                <div class="text-primary cursor-pointer" style="max-width:60%;">
                  <a
                    target="_blank"
                    class="truncate max-w-full"
                    :href="encryptData.httpDesUrl"
                  >
                    {{ encryptData.httpDesUrl }}
                  </a>
                </div>
                <div
                  class="text-primary cursor-pointer mt-xs"
                  style="max-width:60%;"
                >
                  <a
                    target="_blank"
                    class="truncate max-w-full"
                    :href="encryptData.httpAesUrl"
                  >
                    {{ encryptData.httpAesUrl }}
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <el-table
        size="mini"
        border
        :data="tableData"
        max-height="400px"
        v-loading="loading"
      >
        <el-empty slot="empty" />
        <el-table-column label="IP类型" min-width="150" prop="ipType" />
        <el-table-column label="源站IP" min-width="150" prop="sourceIp" />
        <el-table-column label="地区" min-width="150" prop="area" />
        <el-table-column label="线路" min-width="150" prop="line" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import DomainPopover from './DomainPopover.vue'

export default {
  components: {
    DomainPopover
  },
  data() {
    return {
      loading: false,
      tableData: [],
      encryptData: {
        domain: 'domaintest.com',
        ip: '240e:36b:263c:b400:297d:f118:55a6:4647',
        ipArea: '中国, 湖北省',
        httpDes: 'QB3EcreoFmrEonJgCQ',
        httpAes: 'hnE4nwsYnAzIei0QhnE4nwsYnAzIei0Q',
        httpDesUrl:
          'http://69.176.94.50:9091/dns?dn=v7G/QB3EcreoFmrEonJgCQ==&alg=aes&id=11',
        httpAesUrl:
          'https://69.176.94.50:9092/dns?dn=www.165668.com&token=hnE4nwsYnAzIei0Q&query=1&ttl=1'
      }
    }
  },
  created() {},
  methods: {
    // 选择域名
    changeDomain(obj = {}) {
      this.toQuery()
    },

    // 查询数据
    toQuery() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 500)
    },

    // 获取表格数据
    getTableData() {
      this.tableData = [
        {
          ipType: 'IPV4',
          sourceIp: '23.23.23.23',
          area: '美国, 纽约',
          line: '电信'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped></style>

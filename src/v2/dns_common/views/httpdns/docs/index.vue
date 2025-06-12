<template>
  <ants-dialog
    title="移动解析HTTPDNS"
    v-model="dialogVisible"
    ref="dialogRef"
    width="1200px"
    top="5vh"
  >
    <div class="-mt-sm">
      <TitleBorder title="前提" />
      <div class="mt-df mb-lg pl-df" >
        在接入移动解析 HTTPDNS 过程中，您需在移动解析 HTTPDNS 控制台获取对应配置信息后才可正常接入，以下是配置信息含义的说明。
      </div>

      <TitleBorder title="配置信息说明" />
      <ul class="space-y-sm mt-df mb-lg">
        <li
          v-for="(item, idx) in infoList"
          :key="idx"
          class="flex items-center leading-10"
        > 
        <span class="inline-block p-1 bg-ants-text-5 rounded-full mr-df"></span>
          <strong>{{ item.name }}：</strong>
          {{ item.info }}
        </li>
      </ul>

      <TitleBorder title="请求参数说明" />
      <div class="mt-df">
        <el-table
          size="mini"
          border
          :data="tableData"
        >
          <el-table-column
            prop="name"
            label="参数名"
            width="80"
          />
          <el-table-column
            prop="info"
            label="参数含义"
            width="180"
          />
          <el-table-column
            prop="isMust"
            label="是否必选"
            width="70"
          />
          <el-table-column
            prop="value"
            label="取值"
            width="200"
          />
          <el-table-column
            prop="isEncrypt"
            label="加密"
            width="60"
          />
          <el-table-column
            prop="remark"
            label="说明"
            min-width="300"
          />
        </el-table>
      </div>
    </div>
    <template slot="footer">
      <span></span>
    </template>
  </ants-dialog>
</template>

<script>
const infoList = [
    {
        name: '授权 ID',
        info: '使⽤移动解析 HTTPDNS 服务中，开发配置的唯⼀标识。调⽤移动解析 HTTPDNS 的 HTTP 解析接口 http://69.176.94.50 时中传⼊的授权 ID 参数。'
    },
    {
        name: 'DES 加密密钥',
        info: '调⽤移动解析 HTTPDNS 的 HTTP 解析接口 http://69.176.94.50 并使用 DES 加密方式时，对 DNS 请求数据进⾏加密时的加密密钥。'
    },
    {
        name: 'AES 加密密钥',
        info: '调⽤移动解析 HTTPDNS 的 HTTP 解析接口 http://69.176.94.50 并使用 AES 加密方式时，对 DNS 请求数据进⾏加密时的加密密钥。'
    },
    {
        name: 'HTTPS 加密 Token',
        info: '调⽤移动解析 HTTPDNS 的 HTTPS 解析接口 https://69.176.94.50 ，对 DNS 请求数据进⾏鉴权的 Token 信息。'
    }
    // {
    //     name: 'IOS APPID',
    //     info: '使用移动解析 HTTPDNS 服务提供的 IOS 端 SDK 的 appId（应用 ID） 鉴权信息。'
    // },
    // {
    //     name: 'Android APPID',
    //     info: '使用移动解析 HTTPDNS 服务提供的 Android 端 SDK 的 业务 appkey 鉴权信息。'
    // }
]

const tableData = [
  {
    name: 'dn',
    info: '被查询的域名',
    isMust: '是',
    value: '加密前的单个域名长度为253',
    isEncrypt: '是',
    remark: '需在移动解析 HTTPDNS 控制台已添加域名并且为传输加密后的字符串。'
  },
  {
    name: 'id',
    info: '用户标识',
    isMust: '是',
    value: '1 - 10000',
    isEncrypt: '否',
    remark: '如果使用 AES、DES 加密方式，必须传入 ID，不需要进行加密。'
  },
  {
    name: 'alg',
    info: '选择使用何种算法',
    isMust: '是',
    value: '[aes/des]',
    isEncrypt: '否',
    remark: '默认使用 DES 算法，不同算法具有不同密钥。'
  },
  {
    name: 'ip',
    info: 'DNS 请求的 ECS（EDNS-Client-Subnet）值',
    isMust: '否',
    value: 'IPv4/IPv6 地址值',
    isEncrypt: '是',
    remark:
      '默认情况下 HTTPDNS 服务器会查询客户端出口 IP 为 DNS 线路查询 IP，使用 “ip=xxx” 参数，可以指定线路 IP 地址。支持 IPv4/IPv6 地址传入，接口会自动识别。'
  },
  {
    name: 'query',
    info: '结果中返回被查询域名',
    isMust: '否',
    value: '1',
    isEncrypt: '否',
    remark: '单域名查询情况下，此参数要求返回结果中携带被查询域名。'
  },
  {
    name: 'timeout',
    info: '超时返回时间',
    isMust: '否',
    value: '1000 - 5000，单位为毫秒',
    isEncrypt: '否',
    remark: '可用值[1000, 5000]，单位为ms，查询超时时间，默认值为5秒。'
  },
  {
    name: 'ttl',
    info: '查询结果是否返回 TTL 值',
    isMust: '否',
    value: '1',
    isEncrypt: '否',
    remark: '可用值 [1]，不携带此参数，默认为不传递TTL值。'
  },
  {
    name: 'type',
    info: '查询类型',
    isMust: '否',
    value: '[aaaa/AAAA/addrs/ADDRS]',
    isEncrypt: '否',
    remark:
      '可用值[aaaa,AAAA,addrs,ADDRS]。默认查询 A 记录，设置 AAAA/aaaa 查询 AAAA 记录，设置 addrs/ADDRS 同时查询 A 和 AAAA 记录。'
  },
  {
    name: 'clientip',
    info: '查询结果中返回的客户端 IP 地址',
    isMust: '否',
    value: '1',
    isEncrypt: '否',
    remark:
      '可用值 [1]，不携带此参数，默认为不传递 clientip 值。若此参数取值，则返回结果中地址值在 | 符号后，若携带有 ip 参数，返回的是 ip 参数的值，否则返回客户端地址 IP。'
  }
]
export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      btnLoading: false,
      tableData,
      infoList
    }
  },
  methods: {
    show() {
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss">
</style>

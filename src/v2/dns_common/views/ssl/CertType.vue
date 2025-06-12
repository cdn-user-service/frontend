<template>
  <ul class="space-y-xs">
    <li v-for="item in typeList" :key="item.key" class="flex">
      <strong class="whitespace-no-wrap inline-block py-xs my-2"
        >{{ item.name }}：</strong
      >

      <div class="flex-1 flex items-center flex-wrap">
        <span
          v-for="(item2, key2) in item.child"
          :key="key2"
          @click="handleChange(item.key, key2)"
          class="truncate inline-block py-xs rounded-lg mx-1 my-2 cursor-pointer text-center"
          :class="
            query[item.key] == key2
              ? 'bg-primary text-white'
              : 'bg-ants-bg-4 text-ants-text-2'
          "
          style="width: 100px"
        >
          {{ item2 }}
        </span>
      </div>
    </li>
  </ul>
</template>

<script>
const typeList = [
  {
    name: '加密标准',
    key: 'enType',
    child: {
      all: '全部',
      inter: '国际标准',
      domestic: '国密标准'
    }
  },
  {
    name: '证书品牌',
    key: 'productName',
    child: {
      all: '全部',
      ssltrus: '锐安信',
      baidu: '百度Trust',
      positive: 'PositiveSSL',
      sectigo: 'Sectigo',
      digicert: 'DigiCert',
      geotrust: 'GeoTrust',
      globalsign: 'GlobalSign',
      cfca: 'CFCA',
      wotrus: '沃通',
      entrust: 'Entrust',
      certum: 'Certum',
      thawte: 'Thawte'
      // actalis: 'Actalis',
      // 华测: '华测',
      // vTrus: 'vTrus'
    }
  },
  {
    name: '证书类型',
    key: 'validationType',
    child: {
      all: '全部',
      dv: 'DV',
      ov: 'OV',
      ev: 'EV'
    }
  },
  {
    name: '域名类型',
    key: 'supportType',
    child: {
      all: '全部',
      supportSanNo: '单域名',
      supportSan: '多域名',
      supportWildcard: '通配符',
      supportIp: 'IP'
    }
  }
]
export default {
  data() {
    return {
      typeList,
      query: {
        // 加密标准
        enType: 'all',
        // 证书品牌
        productName: 'all',
        // 证书类型
        validationType: 'all',
        // 域名类型
        supportType: 'all'
      }
    }
  },
  created() {},
  methods: {
    handleChange(key, val) {
      this.query[key] = val
      const queryObj = {}
      Object.keys(this.query).forEach((key) => {
        queryObj[key] = this.query[key] === 'all' ? '' : this.query[key]
      })
      this.$emit('change', queryObj)
    }
  }
}
</script>

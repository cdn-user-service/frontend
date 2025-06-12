<template>
  <div
    class="space-y-lg"
    style="min-height:425px;"
  >
    <TitleBorder :title="`SSL证书产品${typeName}信息`" />
    <ul class="space-y-df bg-ants-bg-2 rounded-2xl p-df">
      <li>
        <span>产品名称：</span>
        <strong>{{ sslProductData.productName }}</strong>
      </li>
      <li>
        <span>产品编码：</span>
        <strong>{{ sslProductData.productCode }}</strong>
      </li>
      <li>
        <span>{{typeName}}年限：</span>
        <strong>{{ sslProductData.years }} {{ antsT('年')}}</strong>
      </li>
    </ul>
    <TitleBorder title="证书绑定域名" />
    <div>
      <el-tag
        type="primary"
        size="small"
        class="mr-sm mb-sm"
        v-for="item in sslProductData.domainInfo"
        :key="item"
      >{{ item }}</el-tag>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      // SSL证书商品数据，用于显示
      sslProductData: {
        // 20 = SSL证书购买， 21 = SSL证书续费
        goodsType: 20,
        // 产品名称
        productName: '',
        // 产品编码
        productCode: '',
        // 购买年限
        years: '',
        // 绑定域名
        domainInfo: []
      }
    }
  },
  computed: {
    typeName() {
      return this.sslProductData.goodsType == 20 ? '购买' : '续费'
    }
  },
  methods: {
    init(orderData = {}) {
      this.sslProductData = {
        ...this.sslProductData,
        ...orderData
      }
    }
  }
}
</script>

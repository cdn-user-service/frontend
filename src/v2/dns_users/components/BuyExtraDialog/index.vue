<template>
  <ants-dialog
    title="购买增值业务"
    v-model="dialogVisible"
    width="700px"
    @closed="resetForm"
  >
    <div style="width:100%;" v-loading="dialogLoading">
      <TitleBorder title="可选增值业务" />
      <el-table :data="extraList" size="small">
        <!-- <div slot="empty">
          <el-empty :description="antsT('暂无数据')"> </el-empty>
        </div> -->
        <ants-table-column prop="attrKeyName" label="商品名称" min-width="120">
          <template #default="{ row }">
            <strong>
              {{ row.attrKeyName }}
            </strong>
          </template>
        </ants-table-column>
        <ants-table-column prop="attrPrice" label="单价" min-width="140">
          <template #default="{ row }">
            <span class="text-price">
              {{ row.attrPrice | priceFormat }} / {{ row.attrValue }}
              {{ row.attrUnit }} / 年
            </span>
          </template>
        </ants-table-column>
        <ants-table-column width="200" label="购买数量">
          <template #default="{ row }">
            <ants-input-number
              v-model="row.value"
              size="small"
              :precision="0"
              :step="+row.attrValue"
              :min="0"
              step-strictly
            />
            <!-- <el-input-number
              v-model="row.value"
              size="small"
              :precision="0"
              :step="+row.attrValue"
              :min="0"
              step-strictly
              @change="changeNum(row)"
            ></el-input-number> -->
            <span style="margin-left:5px;">{{ row.attrUnit }}</span>
          </template>
        </ants-table-column>
      </el-table>

      <TitleBorder class="my-lg" title="购买时长" />
      <div>
        <el-radio-group v-model="sum" size="medium">
          <el-radio-button v-for="item in timeList" :key="item" :label="item">
            {{ item }}
            <span> 年</span>
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <span slot="footer">
      <ants-button
        type="info"
        size="small"
        @click="dialogVisible = false"
        text="取 消"
      />

      <ants-button
        type="primary"
        size="small"
        @click="createOrder"
        :loading="btnLoading"
        text="下一步"
      />
    </span>
  </ants-dialog>
</template>

<script>
// api
import {
  createExtraOrder,
  getCommonExtraList
} from '@/v2/dns_users/api/dns/plan'

export default {
  name: 'BuyExtraDialog',
  data() {
    return {
      btnLoading: false,
      dialogLoading: false,
      dialogVisible: false,
      // 选中购买时长
      sum: 1,
      // 购买时长数组
      timeList: [1, 2, 3, 5, 10],

      // 增值业务数据
      extraList: [],
      // 当前选择域名
      domain: ''
    }
  },
  computed: {
    // 计算价格
    activePrice() {
      let price = 0
      const activeGoodsArr = []
      this.extraList.map(item => {
        if (item.value > 0) {
          const nowPrice = (item.value / item.attrValue) * item.attrPrice
          price += nowPrice
          activeGoodsArr.push({
            id: item.id,
            name: item.attrKeyName,
            value: item.value,
            unit: item.attrUnit,
            price: nowPrice / 100
          })
        }
      })
      price *= this.sum
      return {
        price: price / 100,
        goods: activeGoodsArr
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} domain
     */

    showDialog(domain) {
      this.dialogVisible = true
      this.domain = domain
      this.getCommonExtraListData()
    },

    /**
     * @description: 获取可购买增值业务列表
     */

    async getCommonExtraListData() {
      this.dialogLoading = true
      const { data: res } = await getCommonExtraList({
        key: '',
        pagenum: 1,
        pagesize: 100
      })
      this.dialogLoading = false
      if (res.code !== 1) return

      this.extraList =
        res.data &&
        res.data.list.map(item => {
          return {
            ...item,
            value: 0
          }
        })
    },

    /**
     * @description: 提交订单
     */

    async createOrder() {
      // 构造所选增值业务 JSON数据
      const extraInfoArr = []
      this.extraList.forEach(item => {
        if (item.value > 0) {
          const nowPrice = (item.value / item.attrValue) * item.attrPrice
          extraInfoArr.push({
            id: item.id,
            value: item.value / item.attrValue,
            name: item.attrKeyName,
            unit: item.attrUnit,
            price: nowPrice
          })
        }
      })

      if (this.activePrice.price == 0 || !extraInfoArr.length) {
        return this.$msg.error('请选择要购买的商品！')
      }

      this.btnLoading = true

      const orderExtra = JSON.stringify({
        extra_info: extraInfoArr
      })

      const { data: res } = await createExtraOrder({
        domain: this.domain,
        sum: this.sum,
        orderExtra: orderExtra, // 产品属性内容，JSON格式的数据
        couponId: 1 //  优惠券，不用管
      })

      this.btnLoading = false

      if (res.code !== 1) return

      this.$router.push({
        name: 'Order',
        params: { orderId: res.data.orderId }
      })
    },

    // 购买数量改变，保证数值不为空
    changeNum(row) {
      const currentValue = row.value
      const stepValue = row.attrValue
      if (currentValue % stepValue !== 0) {
        this.$nextTick(() => {
          row.value = currentValue + (stepValue - (currentValue % stepValue))
        })
      }
    },

    // 升级对话框重置
    resetForm() {
      this.dialogLoading = false
      this.domain = ''
    }
  }
}
</script>

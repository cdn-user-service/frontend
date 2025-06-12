<template>
  <div class="recharge-box">
    <div class="ants-tips_box content-box">
      <span class="text-sm"
        >充值成功后可前往：财务管理 / 订单列表 /
        <router-link to="/cdn/finance/order/2" class="font-bold underline">
          充值记录
        </router-link>
        查看记录。</span
      >
    </div>
    <el-card class="box-card content-box animated fadeIn">
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="110px"
        label-position="top"
        status-icon
      >
        <el-form-item prop="userId">
          <TitleBorder title="选择用户" />
          <QueryUserSelect ref="QueryUserSelectRef" v-model="form.userId" />
        </el-form-item>

        <el-form-item class="money_box" prop="prices">
          <TitleBorder title="充值金额" />
          <ants-radio-group
            v-model="form.prices"
            size="medium"
            @change="changePrices"
          >
            <ants-radio
              v-for="item in [500000, 1000000, 2000000, 3000000]"
              :key="item"
              :label="item"
              border
              :text="item | priceFormat"
            />
          </ants-radio-group>
          <div>
            <ants-input
              v-model="form.inputPrices"
              type="number"
              placeholder="其他金额"
              @focus="inputFocus"
              @input="nowPrices"
              oninput="if(value.length>12) value = value.slice(0,12)"
              style="max-width:237px;"
            />
            {{ $root.priceUnit }}
          </div>
        </el-form-item>
        <!-- <el-form-item prop="info">
          <TitleBorder title="备注信息" />
          <ants-input
            type="textarea"
            v-model="form.info"
            placeholder="请输入备注信息"
            maxlength="1000"
            rows="3"
          />
        </el-form-item> -->

        <!-- <p class="p_title">
          后台操作保护
        </p>
        <el-form-item label="管理密码" prop="passwd">
          <el-input
            v-model="form.passwd"
            placeholder="请输入管理员密码"
            maxlength="30"
            size="small"
            style="width: 236px;"
          ></el-input>
        </el-form-item> -->
        <el-form-item>
          <div>
            金额：<strong class="text-price text-3xl">{{
              form.payMoney | priceFormat
            }}</strong>
          </div>
          <ants-button
            size="medium"
            type="primary"
            @click="submitRecharge"
            :loading="btnLoading"
            text="立即充值"
            style="padding: 10px 40px;"
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import QueryUserSelect from '@/v2/cdn_admin/components/QueryUserSelect'

import { doAdminRecharge, getOrderDetail } from '@/v2/cdn_admin/api/cdn/finance'

export default {
  components: {
    QueryUserSelect
  },
  data() {
    return {
      btnLoading: false,

      pway: '1',
      form: {
        // 添加对话框的表单数据
        users: '',
        userId: '',
        prices: '',
        info: '',
        inputPrices: null,
        // passwd: '',
        payMoney: 0
      },
      formRules: {
        // 添加分组对话框的规则
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ],
        passwd: [
          {
            required: true,
            message: '请输入管理员密码',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 选择固定金额
    changePrices(val) {
      this.form.inputPrices = null
      this.form.payMoney = val
    },

    // 点击其他金额输入框
    inputFocus() {
      this.form.prices = ''
      if (!this.form.inputPrices) {
        this.form.payMoney = 0
      }
    },

    // 输入其他金额
    nowPrices(val) {
      if (!val) {
        this.form.payMoney = 0
      } else {
        this.form.payMoney = val * 100
      }
    },

    /**
     * @description: 人工充值提交
     */

    submitRecharge() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        // const userIdStr = this.$refs.QueryUserSelectRef.value
        // if (!userIdStr) return this.$msg.error('请选择用户！')

        // 如果没有选择金额
        if (!this.form.payMoney) {
          return this.$msg.error('请选择或输入充值的金额！')
        }

        this.btnLoading = true

        // 发起充值请求
        const { data: res } = await doAdminRecharge({
          userId: this.form.userId,
          amount: this.form.payMoney // 金额以分为单位，要乘以100
        })
        if (res.code !== 1) {
          this.btnLoading = false
          return
        }

        if (res.data && res.data.serialNumber) {
          this.createOrderInfo(res.data.serialNumber)
        }
      })
    },

    /**
     * @description: 充值成功后，需要手动查询订单，才能充值成功
     */

    async createOrderInfo(SerialNumber) {
      const { data: res } = await getOrderDetail({
        SerialNumber
      })
      this.btnLoading = false

      if (res.code !== 1) return

      this.$msg.success('充值成功')
      this.$refs.formRef.resetFields()
      this.form = {
        userId: '',
        prices: '',
        info: '',
        inputPrices: null,
        payMoney: 0
      }
    }
  },
  destroyed() {}
}
</script>

<style lang="scss">
.recharge-box {
  .money_box {
    .ants-radio {
      margin-right: 15px;
      margin-bottom: 15px;
    }
    .ants-radio.is-bordered + .ants-radio.is-bordered {
      margin-left: 0;
    }
  }
}
</style>

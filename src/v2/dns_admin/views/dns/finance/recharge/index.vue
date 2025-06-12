<template>
  <div class="recharge-box">
    <el-card class="content-box animated fadeIn">
      <div slot="header">
        <strong>{{ antsT('人工充值') }}</strong>
        <span class="text-ants-text-4 text-sm ml-lg"
          >充值成功后可前往：财务管理 / 订单列表 /
          <router-link to="/dns/finance/order/1"> 充值记录 </router-link>
          查看记录。</span
        >
      </div>

      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="110px"
        label-position="top"
        status-icon
      >
        <ants-form-item>
          <TitleBorder title="选择用户" />
          <QueryUserSelect
            ref="QueryUserSelectRef"
            size="medium"
            style="width:366px;"
          />
        </ants-form-item>

        <ants-form-item class="money_box" prop="prices">
          <TitleBorder :title="'充值金额'" />
          <el-radio-group
            v-model="form.prices"
            size="medium"
            @change="changePrices"
          >
            <el-radio
              v-for="item in [500000, 1000000, 2000000, 3000000]"
              :key="item"
              :label="item"
              border
              >{{ item | priceFormat }}</el-radio
            >
          </el-radio-group>
          <div>
            <el-input
              v-model="form.inputPrices"
              type="number"
              placeholder="其他金额"
              @focus="inputFocus"
              @input="nowPrices"
              oninput="if(value.length>12) value=value.slice(0,12)"
              style="width:366px;"
            />
            {{ $root.priceUnit }}
          </div>
        </ants-form-item>
        <ants-form-item prop="info">
          <TitleBorder :title="'备注信息'" />
          <el-input
            type="textarea"
            v-model="form.info"
            placeholder="请输入备注信息"
            maxlength="1000"
            rows="4"
            style="width:366px;"
          />
        </ants-form-item>

        <!-- <p class="p_title">
            后台操作保护
          </p>
          <ants-form-item label="管理密码" prop="passwd">
            <el-input
              v-model="form.passwd"
              placeholder="请输入管理员密码"
              maxlength="30"
              size="small"
              style="width: 236px;"
            ></el-input>
          </ants-form-item> -->
        <ants-form-item>
          <div>
            金额：<strong class="text-price text-3xl">{{
              form.payMoney | priceFormat
            }}</strong>
          </div>
          <div class="btn_buy">
            <el-button
              size="medium"
              type="primary"
              @click="submitRecharge"
              :loading="btnLoading"
              style="padding: 10px 36px;"
              >立即充值</el-button
            >
          </div>
        </ants-form-item>
      </ants-form>
    </el-card>
  </div>
</template>

<script>
// api
import { doRecharge, createOrderInfo } from '@/v2/dns_admin/api/dns/finance'
import QueryUserSelect from '@/v2/dns_admin/components/QueryUserSelect'

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
        prices: '',
        info: '',
        inputPrices: null,
        // passwd: '',
        payMoney: 0
      },
      formRules: {
        // 添加分组对话框的规则
        users: [
          {
            required: true,
            message: '用户不能为空',
            trigger: 'change'
          }
        ],
        passwd: [
          {
            required: true,
            message: '管理员密码不能为空',
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
        const userIdStr = this.$refs.QueryUserSelectRef.value
        if (!userIdStr) return this.$msg.error('请选择用户！')

        // 如果没有选择金额
        if (!this.form.payMoney) {
          return this.$msg.error('请选择或输入充值的金额！')
        }

        this.btnLoading = true

        // 发起充值请求
        const { data: res } = await doRecharge({
          userId: userIdStr,
          sum: this.form.payMoney // 金额以分为单位，要乘以100
        })

        if (res.code !== 1) {
          this.btnLoading = false
          return
        }

        if (res.data && res.data.orderId) {
          this.checkOrderInfo(res.data.orderId)
        }
      })
    },

    /**
     * @description: 充值成功后，需要创建一下订单，才能充值成功
     */

    async checkOrderInfo(orderId) {
      const { data: res } = await createOrderInfo(orderId)
      this.btnLoading = false

      if (res.code !== 1) return

      this.$msg.success(
        '已给用户ID：' +
          this.$refs.QueryUserSelectRef.value +
          ' 成功充值 ' +
          this.form.payMoney / 100
      )
      this.$refs.formRef.resetFields()
      this.form = {
        users: '',
        prices: '',
        info: '',
        inputPrices: null,
        payMoney: 0
      }
    }
  }
}
</script>

<style lang="scss">
.recharge-box {
  .money_box {
    .el-radio {
      margin-right: 15px;
      margin-bottom: 15px;
    }
    .el-radio.is-bordered + .el-radio.is-bordered {
      margin-left: 0;
    }
  }
}
</style>

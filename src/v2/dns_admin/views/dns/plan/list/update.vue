<template>
  <ants-form
    class="add_prod_box"
    ref="formRef"
    :model="form"
    :rules="formRules"
    label-width="80px"
    :status-icon="false"
  >
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <el-card class="content-box animated fadeIn" v-loading="$root.loading">
          <div slot="header">
            <strong>产品基本数据配置</strong>
          </div>
          <div class="space-y-8">
            <ants-form-item label="选择分组" prop="productServerGroupId">
              <el-select
                v-model="form.productServerGroupId"
                placeholder="请选择分组"
                style="width:100%;"
              >
                <el-option
                  :value="item.id"
                  :label="item.name"
                  v-for="item in groupList"
                  :key="item.id"
                />
              </el-select>
            </ants-form-item>

            <ants-form-item label="产品名称" prop="productName">
              <ants-input
                placeholder="请输入产品名称"
                v-model="form.productName"
                maxlength="50"
                show-word-limit
              />
            </ants-form-item>

            <!-- <ants-form-item label="产品类型" prop="productType">
              <el-select
                v-model="form.productType"
                placeholder="选择产品类型"
                style="width:100%;"
              >
                <el-option :value="10" label="DNS套餐"/>
                <el-option :value="1" label="充值"/>
                <el-option :value="2" label="实名"/>
              </el-select>
            </ants-form-item> -->

            <ants-form-item label="产品描述" prop="productDescribe">
              <ants-input
                placeholder="请输入产品描述"
                v-model="form.productDescribe"
                maxlength="50"
                show-word-limit
              />
            </ants-form-item>

            <ants-form-item label="产品单价" prop="productUnitPrice">
              <ants-input-number
                v-model="form.productUnitPrice"
                :step="1000"
                :min="0"
                :precision="2"
                class="mr-sm"
              ></ants-input-number>
              <el-select v-model="form.productUnit" style="width:100px;">
                <el-option value="1y" label="一年" />
                <el-option value="1s" label="一季度" />
                <el-option value="1m" label="一个月" />
                <el-option value="1d" label="一天" />
                <el-option value="1p" label="一次" />
              </el-select>
            </ants-form-item>

            <ants-form-item label="购买次数" prop="ownSum">
              <ants-input-number
                v-model="form.ownSum"
                :step="1"
                :min="1"
                :max="999999999"
                :precision="0"
                class="mr-sm"
              />
              <span class="text-sm text-ants-text-4"
                >(限制用户最多可购买次数)</span
              >
            </ants-form-item>

            <ants-form-item label="排 序" prop="weight">
              <ants-input-number
                v-model="form.weight"
                :step="1"
                :min="1"
                :precision="0"
                class="mr-sm"
              />
              <span class="text-sm text-ants-text-4">(越大越靠前)</span>
            </ants-form-item>

            <ants-form-item label="是否发布">
              <el-switch
                v-model="form.status"
                active-color="#13ce66"
                inactive-color="#DCDFE6"
                :active-value="1"
                :inactive-value="0"
              />
            </ants-form-item>
          </div>
        </el-card>
        <ants-button
          type="primary"
          class="hidden-sm-and-down"
          @click="submitAddForm"
          :loading="btnLoading || $root.loading || attrLoading"
          :text="'确认' + nowTypeText"
        />
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <el-card class="content-box animated fadeIn">
          <div slot="header">
            <strong>产品参数配置</strong>
          </div>
          <el-table
            :data="attrList"
            border
            size="mini"
            style="margin-top:0;"
            default-expand-all
            ref="tableRef"
            row-key="id"
            :tree-props="{ children: 'value', hasChildren: 'hasChildren' }"
            @selection-change="handleSelectionChange"
            v-loading="attrLoading"
          >
            <div slot="empty">
              <el-empty description="还没有任何参数，请去添加产品参数">
                <el-button
                  size="small"
                  type="primary"
                  @click="$router.push('/dns/plan/attr')"
                  >前往添加参数</el-button
                >
              </el-empty>
            </div>
            <el-table-column
              type="selection"
              align="center"
              width="55"
              :selectable="selectable"
            >
            </el-table-column>
            <el-table-column prop="attrKeyName" label="参数名" min-width="120">
              <template #default="{ row }">
                {{ row.attrKeyName || row.key }}
              </template>
            </el-table-column>
            <el-table-column prop="attrValue" label="参数值" min-width="200">
              <template #default="{ row }">
                <span
                  v-if="row.attrType == 'bool'"
                  class="el-icon-success text-success"
                >
                  支持</span
                >
                <div v-else>
                  <ants-input-number
                    style="width:130px;margin-right:10px;"
                    size="mini"
                    :step="1"
                    :min="0"
                    :precision="0"
                    v-model="row.attrValue"
                    @change="changeNum(row.attrValue, scope.$index)"
                  ></ants-input-number>
                  <span>{{ row.attrUnit }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column
              prop="attrPrice"
              label="是否可叠加"
              min-width="120"
            >
              <template #default="{ row }">
                <span
                  class="text-error"
                  v-if="!row.key && row.attrSuperposition == 0"
                  >不可叠加</span
                >

                <span
                  class="text-success"
                  v-else-if="!row.key && row.attrSuperposition != 0"
                  >可叠加</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="attrPrice" label="基础价格" min-width="120">
              <template #default="{ row }">
                <span class="text-price" v-if="!row.key">{{
                  row.attrPrice | priceFormat
                }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <div class="content-box hidden-md-and-up" style="margin: 0;">
      <ants-button
        type="primary"
        @click="submitAddForm"
        :loading="btnLoading || $root.loading || attrLoading"
        :text="'确认' + nowTypeText"
      />
    </div>
  </ants-form>
</template>

<script>
// API
import { getItem, doUpdate, getAttrNav } from '@/v2/dns_admin/api/dns/plan'

// API
import { getSeverGroupNav } from '@/v2/dns_admin/api/dns/serve'

export default {
  data() {
    return {
      nowTypeText: '添加',

      attrList: [], // 参数列表数据
      groupList: [], // 服务列表
      selectList: [], // 勾选参数盒子

      btnLoading: false,
      attrLoading: false,
      form: {
        // 添加产品提交表单
        id: 0,
        productName: '', // 产品名称
        productType: '10', // 产品类型
        productJson: [], // 产品属性，JSON数据
        productDescribe: '', // 套餐描述
        productUnitPrice: 0, // 产品单价， 以分为单位
        productServerGroupId: null, // 节点服务组ID，
        productUnit: '1y', // 单位[1p= 1次 ,1y=1年,1s=1季,1m=1月,1d=1天]
        weight: 1, // 排序，数值越大越靠前
        status: 0, // 状态，0 = 下架， 1 = 上架
        ownSum: 1 // 可购买套餐数
      },

      formRules: {
        // 添加产品验证规则
        productName: [
          {
            required: true,
            message: '产品名称不能为空',
            trigger: ['change', 'blur']
          }
        ],
        productDescribe: [
          {
            required: true,
            message: '产品描述不能为空',
            trigger: ['change', 'blur']
          }
        ],
        productType: [
          {
            required: true,
            message: '请选择产品类型',
            trigger: 'change'
          }
        ],
        productServerGroupId: [
          {
            required: true,
            message: '请选择分组',
            trigger: 'change'
          }
        ],
        productJson: [
          {
            required: true,
            message: '请输入产品参数',
            trigger: ['change', 'blur']
          }
        ],
        productUnitPrice: [
          {
            required: true,
            message: '请输入产品单价',
            trigger: ['change', 'blur']
          }
        ],
        productUnit: [
          {
            required: true,
            message: '请选择产品价格',
            trigger: 'change'
          }
        ],
        weight: [
          {
            required: true,
            message: '排序不能为空',
            trigger: ['change', 'blur']
          }
        ],
        ownSum: [
          {
            required: true,
            message: '请输入购买次数限制',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    // 如果为修改，则获取当前消息内容
    if (this.$route.params.id != 'add') {
      this.nowTypeText = '编辑'
      this.form.id = this.$route.params.id
      this.getGoodsInfo()
    } else {
      this.nowTypeText = '添加'
      this.form.id = 0
      this.getAttrList()
    }

    this.getSeverGroupList()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取产品信息
     */

    async getGoodsInfo() {
      this.$root.loading = true
      this.attrLoading = true

      const { data: res } = await getItem(this.form.id)

      this.$root.loading = false

      if (res.code !== 1) return

      // 解析产品参数字符串
      let productJSON = null
      if (res.product.productJson) {
        productJSON = JSON.parse(res.product.productJson)
        res.product.productJson = productJSON || []
      } else {
        res.product.productJson = []
      }
      res.product.productUnitPrice = res.product.productUnitPrice / 100

      console.log(res.product)
      this.form = res.product || {}

      // 如果为修改
      this.getAttrList()
    },

    /**
     * @description: 获取server 分组列表数据
     */

    async getSeverGroupList() {
      const { data: res } = await getSeverGroupNav()
      if (res.code !== 1) return
      this.groupList = res.data || []
    },

    /**
     * @description: 获取参数列表
     */

    async getAttrList() {
      this.attrLoading = true
      const { data: res } = await getAttrNav()

      this.attrLoading = false

      if (res.code !== 1) return
      const attrArr = []
      res.data.map((item, idx) => {
        attrArr.push(...item.value)
        // if (!item.key) {
        //   attrArr.push(...item.value)
        // } else {
        //   attrArr.push({
        //     id: item.key,
        //     key: item.key,
        //     value: item.value
        //   })
        // }
      })
      this.attrList = attrArr || []

      // 设置选中状态
      this.$nextTick(() => {
        this.attrList.map(item => {
          this.form.productJson.map(item1 => {
            if (item.id == item1.id) {
              // 设置为勾选中
              this.$refs.tableRef.toggleRowSelection(item, true)
              // 设置值
              item.attrValue = item1.attrValue
            }
          })
        })
      })
    },

    handleSelectionChange(val) {
      this.selectList = val
    },

    selectable(row, index) {
      if (row.attrKeyName) {
        return true
      }
    },

    /**
     * @description: 添加修改产品提交
     */

    submitAddForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        if (!this.selectList.length) return this.$msg.error('请选择产品参数')
        this.btnLoading = true

        const postData = {
          ...this.form
        }

        const productJson = this.selectList.map(item => {
          return {
            id: item.id,
            attrKeyName: item.attrKeyName,
            attrValue: item.attrValue,
            attrType: item.attrType,
            attrUnit: item.attrUnit
          }
        })

        // 价格已分为单位，要 *100
        postData.productUnitPrice = postData.productUnitPrice * 100
        // 将 productJson 数组转为JSON
        postData.productJson = JSON.stringify(productJson)

        const { data: res } = await doUpdate(
          postData,
          !this.form.id ? 'save' : 'update'
        )

        this.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success(this.nowTypeText + '产品成功')
        this.$router.push('/dns/plan/list')
      })
    },

    // 参数值改变，保证数值不为空
    changeNum(val, idx) {
      if (!val) {
        this.$nextTick(() => {
          this.attrList[idx].attrValue = 1
        })
      }
    }
  }
}
</script>

<style lang="scss">
.add_prod_box1 {
  .ants-input-number {
    width: 230px;
    margin-right: 20px;
    .ants-input {
      width: 230px;
    }
  }
  .unit_select {
    width: 100px !important;
    .ants-input {
      width: 100px !important;
    }
  }
}
</style>

<template>
  <el-card
    class="content-box animated fadeIn"
    v-loading="$root.loading"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="150px"
      status-icon
    >
      <TitleBorder :title="'选择服务分组'" />

      <ants-form-item
        label="选择分组"
        prop="groupId"
      >
        <el-select
          v-model="form.groupId"
          placeholder="请选择分组"
          style="width:100%;"
        >
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </ants-form-item>

      <TitleBorder
        title="ElkServer"
        class="margin-tb"
      />
      <ants-form-item
        label="ElkServerIp"
        prop="elasticsearchServerIp"
      >
        <ants-input
          v-model="form.elasticsearchServerIp"
          placeholder="请输入ElkServerIp"
        ></ants-input>
      </ants-form-item>
      <ants-form-item
        label="ElkServerPort"
        prop="elasticsearchServerPort"
      >
        <ants-input
          v-model="form.elasticsearchServerPort"
          placeholder="请输入ElkServerPort"
        ></ants-input>
      </ants-form-item>
      <ants-form-item
        label="ElkServerAuth"
        prop="elasticsearchServerAuth"
      >
        <ants-input
          v-model="form.elasticsearchServerAuth"
          placeholder="请输入ElkServerAuth"
        ></ants-input>
      </ants-form-item>

      <TitleBorder
        :title="'RedisServer'"
        class="margin-tb"
      />
      <ants-form-item
        label="RedisServerIp"
        prop="redisServerIp"
      >
        <ants-input
          v-model="form.redisServerIp"
          placeholder="请输入RedisServerIp"
        ></ants-input>
      </ants-form-item>
      <ants-form-item
        label="RedisServerPort"
        prop="redisServerPort"
      >
        <ants-input
          v-model="form.redisServerPort"
          placeholder="请输入RedisServerPort"
        ></ants-input>
      </ants-form-item>

      <ants-form-item
        label="RedisServerAuth"
        prop="redisServerAuth"
      >
        <ants-input
          v-model="form.redisServerAuth"
          placeholder="请输入RedisServerAuth"
        ></ants-input>
      </ants-form-item>

      <TitleBorder
        :title="'Prometheus'"
        class="margin-tb"
      />
      <ants-form-item
        label="PrometheusIp"
        prop="prometheusIp"
      >
        <ants-input
          v-model="form.prometheusIp"
          placeholder="请输入PrometheusIp"
        ></ants-input>
      </ants-form-item>
      <ants-form-item
        label="PrometheusPort"
        prop="prometheusPort"
      >
        <ants-input
          v-model="form.prometheusPort"
          placeholder="请输入PrometheusPort"
        ></ants-input>
      </ants-form-item>

      <TitleBorder
        :title="'NS属性'"
        class="margin-tb"
      />

      <ants-form-item
        label="NS1"
        :rules="formRules.ns1"
      >
        <ants-input
          v-model="form.extraNsJson.ns1"
          placeholder="请输入NS1"
        ></ants-input>
      </ants-form-item>

      <ants-form-item
        label="NS2"
        :rules="formRules.ns2"
      >
        <ants-input
          v-model="form.extraNsJson.ns2"
          placeholder="请输入NS2"
        ></ants-input>
      </ants-form-item>

      <TitleBorder
        :title="'SOA属性'"
        class="margin-tb"
      />

      <ants-form-item
        label="MNAME"
        :rules="formRules.mname"
      >
        <ants-input
          v-model="form.extraSoaJson.mname"
          placeholder="请输入MNAME"
        ></ants-input>
      </ants-form-item>

      <ants-form-item
        label="RNAME"
        :rules="formRules.rname"
      >
        <ants-input
          v-model="form.extraSoaJson.rname"
          placeholder="请输入RNAME"
        ></ants-input>
      </ants-form-item>

      <TitleBorder
        :title="'dnsClient'"
        class="margin-tb"
      />
      <ants-form-item
        label="IP 地址"
        prop="dnsClientList"
      >
        <ants-input
          v-model="form.dnsClientList"
          placeholder="请输入 IP 地址，一行一个"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 10 }"
        ></ants-input>
        <div class="margin-top-xs text-sm ants-font-4">
          请输入 IP 地址，一行一个，不能重复
        </div>
      </ants-form-item>

      <ants-form-item class="margin-top-lg">
        <ants-button
          :loading="btnLoading"
          type="primary"
          @click="submitUpdate()"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
// API
import {
  doUpdateServer,
  getSeverGroupNav,
  getServerInfoById
} from '@/v2/dns_admin/api/dns/serve'
export default {
  data() {
    const checkIpsArr = (rule, value, callback) => {
      // 将数据拆分成一行一个
      const newValue = value.trim().split(/[(\r\n)\r\n]+/)
      const checkIps =
        /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/
      let isOk = false
      const nowArr = [] // 临时数组
      newValue.every((e, i) => {
        isOk = checkIps.test(e.trim())
        if (!isOk) {
          callback(new Error('IP地址格式不正确：' + e))
          return isOk
        }

        // 判断IP地址是否重复
        // 如果当前IP地址在数组中第一次出现的位置不是 i， 则认为该IP地址重复
        nowArr[i] = e.trim() // 将数据存入临时数组
        if (nowArr.indexOf(e.trim()) != i) {
          isOk = false
          callback(new Error('IP地址不能重复：' + e))
        }
        return isOk
      })

      if (isOk) {
        this.dnsClientArr = newValue
        callback()
      }
    }

    return {
      nowTypeText: '添加',

      btnLoading: false,

      form: {
        id: null,
        groupId: null,

        kafkaServerIp: '',
        kafkaServerPort: '',
        kafkaServerAttr: '', // 备注信息，字符串
        kafkaServerAuthU: '',
        kafkaServerAuthP: '',

        redisServerIp: '',
        redisServerPort: '',
        redisServerAuth: '',
        redisServerAttr: '', // 备注信息，字符串

        prometheusIp: '',
        prometheusPort: '',
        prometheusAttr: '', // 备注信息，字符串

        // 严格JSON数据
        extraNsJson: {
          ns1: '', // 域名格式
          ns2: '' // 域名格式
        },
        // 严格JSON数据
        extraSoaJson: {
          mname: '', // 域名格式
          rname: '' // 域名格式
        },

        // 节点监控数据，一个JSON数组，ip必填
        dnsClientList: '',
        status: 1 // 状态
      },

      formRules: {
        groupId: [
          {
            required: true,
            message: '请选择分组',
            trigger: 'change'
          }
        ],
        kafkaServerIp: [
          {
            required: true,
            message: 'KafkaServerIp不能为空',
            trigger: ['blur', 'change']
          }
        ],
        elasticsearchServerIp: [
          {
            required: true,
            message: '请输入ElkServerIp',
            trigger: ['blur', 'change']
          }
        ],
        elasticsearchServerPort: [
          {
            required: true,
            message: '请输入ElkServerPort',
            trigger: ['blur', 'change']
          }
        ],
        elasticsearchServerAuth: [
          {
            required: true,
            message: '请输入ElkServerAuth',
            trigger: ['blur', 'change']
          }
        ],
        kafkaServerPort: [
          {
            required: true,
            message: 'KafkaServerPort不能为空',
            trigger: ['blur', 'change']
          }
        ],
        kafkaServerAuthU: [
          {
            required: true,
            message: 'Username不能为空',
            trigger: ['blur', 'change']
          }
        ],
        kafkaServerAuthP: [
          {
            required: true,
            message: 'Password不能为空',
            trigger: ['blur', 'change']
          }
        ],
        redisServerIp: [
          {
            required: true,
            message: 'RedisServerIp不能为空',
            trigger: ['blur', 'change']
          }
        ],
        redisServerPort: [
          {
            required: true,
            message: 'RedisServerPort不能为空',
            trigger: ['blur', 'change']
          }
        ],
        redisServerAuth: [
          {
            required: true,
            message: 'RedisServerAuth不能为空',
            trigger: ['blur', 'change']
          }
        ],

        prometheusIp: [
          {
            required: true,
            message: 'PrometheusIp不能为空',
            trigger: ['blur', 'change']
          }
        ],
        prometheusPort: [
          {
            required: true,
            message: 'PrometheusPort不能为空',
            trigger: ['blur', 'change']
          }
        ],

        ns1: [
          {
            required: true,
            message: 'NS1属性不能为空',
            trigger: ['blur', 'change']
          }
        ],
        ns2: [
          {
            required: true,
            message: 'NS2属性不能为空',
            trigger: ['blur', 'change']
          }
        ],

        mname: [
          {
            required: true,
            message: 'MNAME属性不能为空',
            trigger: ['blur', 'change']
          }
        ],
        rname: [
          {
            required: true,
            message: 'RNAME属性不能为空',
            trigger: ['blur', 'change']
          }
        ],

        dnsClientList: [
          {
            required: true,
            message: '请输入IP地址，一行一个',
            trigger: ['blur', 'change']
          },
          {
            validator: checkIpsArr,
            trigger: 'blur'
          }
        ]
      },
      dnsClientArr: [],

      groupList: []
    }
  },
  created() {
    this.getSeverGroupList()

    // 如果为修改，则获取当前消息内容
    const PARAMS_ID = this.$route.params.id
    if (PARAMS_ID != 'add') {
      this.nowTypeText = '编辑'
      this.form.id = PARAMS_ID
    } else {
      this.nowTypeText = '添加'
      this.form.id = null
    }
  },
  methods: {
    /**
     * @description: 获取分组列表
     */

    async getSeverGroupList() {
      this.$root.loading = true

      const { data: res } = await getSeverGroupNav()
      if (res.code !== 1) {
        this.$root.loading = false
        return
      }
      this.groupList = res.data || []

      if (this.$route.params.id !== 'add') {
        this.getNodeInfoById()
      } else {
        this.$root.loading = false
      }
    },

    /**
     * @description: 根据 id 获取当前节点信息
     */

    async getNodeInfoById() {
      this.$root.loading = true
      const { data: res } = await getServerInfoById({
        id: this.form.id
      })
      this.$root.loading = false

      if (res.code !== 1) return
      const formData = res.data || {}
      // 解构数据
      formData.extraNsJson =
        formData.extraNsJson && JSON.parse(formData.extraNsJson)

      formData.extraSoaJson =
        formData.extraSoaJson && JSON.parse(formData.extraSoaJson)

      const dnsClientObjArr =
        formData.dnsClientList && JSON.parse(formData.dnsClientList)
      formData.dnsClientList = dnsClientObjArr
        .map((item) => {
          return item.ip
        })
        .join('\n')
      console.log(formData)
      this.form = formData
    },

    /**
     * @description: 添加-编辑节点提交
     */

    submitUpdate() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true

        // 构造数据
        const postForm = {
          ...this.form
        }

        const dnsClientObjArr = this.dnsClientArr.map((ip) => {
          return {
            ip
          }
        })

        postForm.extraNsJson = JSON.stringify(postForm.extraNsJson)
        postForm.extraSoaJson = JSON.stringify(postForm.extraSoaJson)
        postForm.dnsClientList = JSON.stringify(dnsClientObjArr)

        try {
          const { data: res } = await doUpdateServer(postForm)

          this.btnLoading = false
          if (res.code !== 1) return

          this.$msg.success(`${this.nowTypeText}节点成功`)
          this.$router.replace('/dns/serve/node')
        } catch (error) {
          this.btnLoading = false
          throw error
        }
      })
    }
  }
}
</script>

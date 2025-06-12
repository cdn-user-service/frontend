<template>
  <div>
    <InjPen ref="InjPenRef" v-on="$listeners" v-bind="$attrs" />

    <!-- <PubPreciseWaf ref="PubPreciseWafRef" v-on="$listeners" v-bind="$attrs" /> -->
    <!-- <PubWaf ref="PubWafRef" v-on="$listeners" v-bind="$attrs" /> -->

    <IpWhite ref="IpWhiteRef" v-on="$listeners" v-bind="$attrs" />

    <IpBlack ref="IpBlackRef" v-on="$listeners" v-bind="$attrs" />
    <!-- <TokenSet v-on="$listeners" v-bind="$attrs"/> -->
    <!-- <ants-form-card>
      <template slot="title">漏洞攻击防护</template>
      <template slot="info">
        <ul class="space-y-6">
          <li>
            基于大数据人工智能攻击识别引擎，可防御SQL注入、XSS攻击、恶意扫描等各种漏洞攻击。同时通过访客行为和安全大数据分析，深层次拦截WebShell；
          </li>
          <li>
            如需具体配置，请跳转至
            <router-link to="waf">精准访问控制</router-link>
          </li>
        </ul>
      </template>
      <template slot="content">
        <ul class="space-y-8">
          <li>
            <ants-radio-group v-model="form.loudonggonjiRadio" size="small">
              <ants-radio-button :label="0" text="关闭" />
              <ants-radio-button :label="1" text="观察模式" />
              <ants-radio-button :label="2" text="拦截模式" />
              <ants-radio-button :label="3" text="封禁模式" />
            </ants-radio-group>
          </li>

          <li
            class="text-primary text-sm p-df space-y-5 bg-primary-light border border-primary rounded-lg"
          >
            <div class="font-semibold">
              <span class="el-icon-info"></span>
              1. 模式分为观察模式、拦截模式和封禁模式
            </div>
            <div>观察模式：实时检测分析攻击，但不对攻击进行拦截；</div>
            <div>
              拦截模式：发现有攻击时，{{ $root.webName }} 进行实时拦截；
            </div>
            <div>
              封禁模式：发现有攻击时，{{ $root.webName }}
              进行实时拦截，同时会将触发一定规则的攻击IP加入黑名单中。
            </div>
            <div class="font-semibold">
              <span class="el-icon-info"></span>
              2. 等级分为普通和严格
            </div>
            <div>普通：较为宽松，基本无误防；</div>
            <div>严格：严格检查，综合多方面因子，可能导致误防；</div>
            <div>
              当您发现在严格模式下存在较多误拦截，或者业务存在较多不可控的用户输入（例如富文本编辑器、技术论坛等），建议您选择普通模式；
            </div>
            <div>
              当您需要更严格地防护SQL注入、命令执行、路径穿越时，建议您选择严格模式。
            </div>
          </li>
          <li>
            <span class="text-ants-text-4 mr-lg">等级选择</span>
            <ants-radio-group v-model="form.dengjixuanzeRadio">
              <ants-radio :label="1" text="普通" />
              <ants-radio :label="2" text="严格" />
            </ants-radio-group>
          </li>
          <li>
            <span class="text-ants-text-4 mr-lg">AI 引擎</span>
            <el-switch
              v-model="form.apiyinqSwitch"
              :active-value="1"
              :inactive-value="0"
              v-loading="switchLoading"
              :disabled="switchLoading"
              element-loading-spinner="el-icon-loading"
              class="ants-switch-loading"
            />
            <el-tooltip
              effect="dark"
              content="基于神经网络和深度学习算法的防御类型，有效防护未知威胁"
              placement="right"
            >
              <span
                class="el-icon-info text-primary text-df cursor-pointer ml-xs align-middle"
              ></span>
            </el-tooltip>
          </li>
        </ul>
      </template>
    </ants-form-card> -->

    <!-- <ants-form-card>
      <template slot="title">Webshell</template>
      <template slot="info">
        当前服务不支持，您可以联系商务开通此项功能
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.webshellSwitch"
          :active-value="1"
          :inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="switchLoading"
          :disabled="switchLoading"
        />
      </template>
    </ants-form-card> -->

    <!-- <ants-form-card>
      <template slot="title">{{antsT('WAF拦截页面定制')}}</template>
      <template slot="info">
        {{antsT('定制专属WAF拦截页面，不开启是默认使用WEB安全加速提供的拦截页面')}}
        
      </template>
      <template slot="content">
        <ants-radio-group v-model="form.weblanjieRadio">
          <ants-radio :label="1" :text="`${antsT('默认')}${$root.webName}${antsT('错误页面')}`" />
          <ants-radio :label="3" text="自定义HTML" />
        </ants-radio-group>

        <ul class="mt-lg space-y-8" v-if="form.weblanjieRadio === 3">
          <li
            class="text-primary text-sm p-sm bg-primary-light border border-primary rounded-lg"
          >
          {{antsT('当启用自定义HTML模式，可以通过编辑HTML代码自定义拦截页面，代码中不能包含JS')}}
          </li>
          <li>
            <el-input
              type="textarea"
              v-model="form.weblanjieInput"
              :autosize="{ minRows: 10, maxRows: 20 }"
              :placeholder="`<h1>${antsT('WAF拦截页面定制')}</h1>`"
            ></el-input>
          </li>
          <li>
            <ants-button
              size="small"
              type="primary"
              icon="el-icon-edit"
              text="提 交"
            />
            <ants-button
              size="small"
              type="info"
              icon="el-icon-view"
              text="预 览"
            />
          </li>
        </ul>
      </template>
    </ants-form-card> -->
  </div>
</template>

<script>
// import PubWaf from './components/PubWaf'
import IpWhite from './components/IpWhite'
import IpBlack from './components/IpBlack'
import InjPen from './components/InjPen'
// import PubPreciseWaf from './components/PubPreciseWaf'
// import TokenSet from './components/TokenSet'
export default {
  components: {
    // PubPreciseWaf,
    // PubWaf,
    IpWhite,
    IpBlack,
    InjPen
    // TokenSet
  },
  data() {
    return {
      switchLoading: false,
      form: {
        loudonggonjiRadio: 1,
        dengjixuanzeRadio: 1,
        apiyinqSwitch: 0,

        webshellSwitch: 0,

        weblanjieRadio: 1,
        weblanjieInput: ''
      }
    }
  },
  created() {
    // this.getSiteDetail()
  },
  methods: {
    /**
     * @description: 获取站点配置数据
     */

    async getSiteDetail() {
      const { data: res } = await this.$listeners.getSiteDetail('pub_waf')

      // res.attr.forEach(item => {
      //   // 网站漏洞防御
      //   if (item.pkey === 'pub_waf_forbid_selects') {
      //     this.$refs.PubWafRef.tableData =
      //   }
      // })
    }
  }
}
</script>

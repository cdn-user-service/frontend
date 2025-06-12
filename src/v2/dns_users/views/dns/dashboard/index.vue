<template>
  <div class="content-box animated fadeIn">
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 17 }"
        :xl="{ span: 17 }"
      >
        <el-row :gutter="20">
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 12 }"
            :md="{ span: 12 }"
            :lg="{ span: 12 }"
            :xl="{ span: 12 }"
          >
            <el-card class="mb-lg">
              <el-skeleton :rows="5" animated :loading="loading">
                <div style="height:160px;">
                  <div class="flex justify-between items-start">
                    <TitleBorder title="账户信息" />
                    <div class="space-x-4">
                      <el-tooltip
                        effect="dark"
                        :content="
                          userinfo[key]
                            ? `${item.name}：${userinfo[key]}`
                            : `未绑定${item.name}`
                        "
                        placement="top"
                        v-for="(item, key) in bindAccountObj"
                        :key="key"
                      >
                        <span
                          class="inline-block bg-ants-bg-4 rounded-full text-center cursor-pointer"
                          style="width:25px;height:25px;line-height:25px;"
                          :class="
                            userinfo[key] ? 'text-primary' : 'text-ants-text-4'
                          "
                        >
                          <i :class="item.icon" class="text-sm"></i>
                        </span>
                      </el-tooltip>
                    </div>
                  </div>

                  <div class="flex pt-xl">
                    <div>
                      <el-avatar
                        :src="require('@/assets/img/avatar.png')"
                        :size="50"
                        class="border-2 border-white"
                        style="box-shadow: 0 0 15px rgba(0,0,0,0.2);"
                      />
                    </div>
                    <div class="flex-1 pl-lg text-sm">
                      <el-row>
                        <el-col :span="12">
                          <ul class="space-y-df ">
                            <li class="whitespace-no-wrap">
                              <span class="text-ants-text-3">Hi：</span>
                              <strong>
                                {{ userinfo.username }}
                              </strong>
                            </li>
                            <li>
                              <span class="text-ants-text-3">实名认证：</span>

                              <el-popover
                                v-if="userinfo.realnameStatus === 1"
                                placement="top-start"
                                trigger="hover"
                              >
                                <div class="text-sm">
                                  {{
                                    antsT('您已完成个人实名认证，可正常使用')
                                  }}
                                  {{ $root.webName }} {{ antsT('服务，') }}
                                  <router-link
                                    v-if="isShowVerify"
                                    to="/dns/account/verification"
                                    >{{ antsT('查看详情') }}</router-link
                                  >
                                </div>
                                <span
                                  slot="reference"
                                  class="el-icon-success inline-block auth-tag text-sm mr-sm"
                                >
                                  {{ antsT('已实名') }}</span
                                >
                              </el-popover>

                              <span
                                class="el-icon-remove inline-block auth-tag text-sm error-auth-tag mr-sm"
                                @click="toVerify()"
                                v-else
                              >
                                {{ antsT('未实名') }}</span
                              >
                            </li>
                          </ul>
                        </el-col>
                        <el-col :span="12">
                          <ul class="space-y-df pl-lg">
                            <li>
                              <span class="text-ants-text-3">账号ID：</span>
                              {{ userinfo.userId }}
                            </li>
                            <li>
                              <span class="text-ants-text-3">登录IP：</span>
                              {{ loginLog.ip }}
                            </li>
                          </ul>
                        </el-col>
                      </el-row>

                      <div class="mt-df">
                        <span class="text-ants-text-3">最后登录时间：</span>
                        {{ loginLog.createDate }}
                      </div>
                    </div>
                  </div>
                </div>
              </el-skeleton>

              <div class="pt-lg border-t border-ants-border-2 border-dashed">
                <ants-button
                  type="primary"
                  size="small"
                  plain
                  icon="el-icon-setting"
                  text="账户设置"
                  @click="$router.push('/dns/account/info')"
                />

                <ants-button
                  type="primary"
                  size="small"
                  plain
                  icon="el-icon-lock"
                  text="密码修改"
                  @click="$router.push('/dns/account/info')"
                />

                <ants-button
                  v-if="isShowVerify"
                  type="primary"
                  size="small"
                  plain
                  icon="el-icon-coordinate"
                  text="实名认证"
                  @click="toVerify()"
                />
              </div>
            </el-card>
          </el-col>
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 12 }"
            :md="{ span: 12 }"
            :lg="{ span: 12 }"
            :xl="{ span: 12 }"
          >
            <el-card class="mb-lg">
              <el-skeleton :rows="5" animated :loading="loading">
                <div style="height:160px;">
                  <div class="">
                    <TitleBorder title="资产信息" />
                  </div>
                  <div class="flex pt-xl items-center text-sm">
                    <div class="">
                      <div class="text-ants-text-3 mb-lg">总充值</div>
                      <div class="text-4xl font-semibold text-ants-text-3">
                        {{ propertyInfo.total | priceFormat }}
                      </div>
                    </div>
                    <div class="px-xl" style="height:50px;">
                      <div
                        class="h-full border-l border-ants-border-2 border-dashed"
                      ></div>
                    </div>
                    <div class="">
                      <div class="text-ants-text-3 mb-lg">可用余额</div>
                      <div class="text-4xl text-price font-semibold">
                        {{ propertyInfo.propertyBalance | priceFormat }}
                      </div>
                    </div>
                  </div>
                </div>
              </el-skeleton>

              <div class="pt-lg border-t border-ants-border-2 border-dashed">
                <ants-button
                  type="primary"
                  size="small"
                  plain
                  icon="el-icon-document"
                  text="资金明细"
                  @click="$router.push('/dns/finance/order')"
                />

                <ants-button
                  type="primary"
                  size="small"
                  plain
                  icon="el-icon-coin"
                  text="余额充值"
                  @click="$router.push('/dns/finance/recharge')"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="mb-lg">
          <div class="mb-lg flex items-start justify-between">
            <TitleBorder title="我的域名" />

            <div>
              <ants-input
                class="ants-search_input mr-sm"
                placeholder="输入域名搜索"
                clearable
                v-model="domain"
                size="small"
                @change="searchDomain"
              >
                <i slot="prefix" class="el-input__icon aicon icon-sousuo"></i>
              </ants-input>
              <ants-button
                size="small"
                type="primary"
                text="搜索"
                @click="searchDomain"
              />
            </div>
          </div>

          <el-row :gutter="20">
            <el-col
              :xs="{ span: 12 }"
              :sm="{ span: 12 }"
              :md="{ span: 6 }"
              :lg="{ span: 6 }"
              :xl="{ span: 6 }"
              v-for="(item, key) in domainCountObj"
              :key="key"
            >
              <div
                class="p-df mb-lg rounded-2xl border-ants-border-2 border border-dashed  flex items-center cursor-pointer hover:shadow"
                @click="$router.push(item.url)"
              >
                <div
                  style="height: 50px;line-height:50px;width:50px;"
                  class="text-center rounded-2xl"
                >
                  <span
                    :class="item.icon"
                    class="align-middle"
                    style="font-size:28px;"
                  ></span>
                </div>
                <div class="pl-lg">
                  <div class="mb-df">
                    {{ antsT(item.name) }}
                  </div>
                  <div>
                    <span
                      class="font-semibold mr-xs"
                      v-loading="loading"
                      element-loading-spinner="el-icon-loading"
                    >
                      <span class="text-3xl">{{ countDomain[key] }}</span>
                    </span>
                    个
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="mb-lg">
          <div class="mb-lg flex justify-between">
            <TitleBorder title="我的套餐" />
            <span
              class="text-sm cursor-pointer text-primary"
              @click="$router.push('/dns/plan/own')"
              >查看
              <i class="el-icon-arrow-right"></i>
            </span>
          </div>

          <el-row :gutter="20">
            <el-col
              :xs="{ span: 12 }"
              :sm="{ span: 12 }"
              :md="{ span: 6 }"
              :lg="{ span: 6 }"
              :xl="{ span: 6 }"
              v-for="(item, key) in planCountObj"
              :key="key"
            >
              <div
                class="p-lg mb-lg bg-ants-bg-4 rounded-2xl flex items-center justify-between"
              >
                <div class="">
                  <span class="px-xs">{{ antsT(item.name) }}</span>
                </div>
                <span class="font-semibold" :class="item.color">{{
                  countPlan[key] || 0
                }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 7 }"
        :xl="{ span: 7 }"
      >
        <RightNotice />

        <RightContact />
      </el-col>
    </el-row>
  </div>
</template>

<script>
// API
import { getChartData } from '@/v2/dns_users/api/public'
import { getList as getLogList } from '@/v2/dns_users/api/dns/log'

import RightNotice from './RightNotice'
import RightContact from './RightContact'

const bindAccountObj = {
  mobile: {
    name: '手机号',
    icon: 'el-icon-phone'
  },
  mail: {
    name: '邮箱',
    icon: 'el-icon-message'
  },
  wechatOpenid: {
    name: '微信',
    icon: 'aicon icon-weixin1'
  }
}

const domainCountObj = {
  domain: {
    name: '我的域名',
    icon: 'el-icon-s-flag text-primary',
    url: '/dns/domain'
  },
  ptr: {
    name: '反向解析',
    icon: 'el-icon-s-opportunity text-primary',
    url: '/dns/domain/ptr'
  },
  monitor: {
    name: '调度任务',
    icon: 'el-icon-s-marketing text-primary',
    url: '/dns/a-monitor/gtm'
  },
  httpdns: {
    name: 'HTTPDNS',
    icon: 'el-icon-s-shop text-primary',
    url: '/dns/httpdns/configure'
  }
}

const planCountObj = {
  total: {
    name: '总数',
    color: 'text-ants-text-3'
  },
  used: {
    name: '使用中',
    color: 'text-primary'
  },
  unused: {
    name: '未使用',
    color: 'text-success'
  },
  expired: {
    name: '已过期',
    color: 'text-error'
  }
}

export default {
  components: {
    RightNotice,
    RightContact
  },
  data() {
    return {
      loading: false,
      bindAccountObj,
      domainCountObj,
      planCountObj,
      domain: '',

      // 用户登录信息
      loginLog: {
        // 登录时间
        createDate: '',
        // 登录IP
        ip: '',
        // 登录地点
        area: ''
      },
      // 用户信息
      userinfo: {
        userId: 0,
        username: '-',
        // 1已实名 0未实名
        realnameStatus: 1,
        // 可用余额
        propertyBalance: 0,
        // 登录方式
        loginType: 'username',
        // 手机号
        mobile: '',
        // 邮箱
        mail: '',
        // 微信号
        wechatOpenid: ''
      },
      // 资产信息
      propertyInfo: {
        // 总充值
        total: 0,
        // 可用余额
        propertyBalance: 0
      },
      // 我的域名数据统计
      countDomain: {
        // 域名数
        domain: 0,
        // 域名错误数据
        domainErr: 0,
        // httpdns
        httpdns: 0,
        // 反向解析
        ptr: 0,
        // A监控
        monitor: 0
      },
      // 我的套餐统计
      countPlan: {
        // 总数
        total: 0,
        // 使用中
        used: 0,
        // 未使用
        unused: 0,
        // 已过期
        expired: 0
      }
    }
  },
  computed: {
    // 后台是否开启强制实名
    isShowVerify({ $root }) {
      const { realName } = $root.webConfig.power
      return realName == 1
    }
  },
  created() {
    this.getDashboardData()
    this.getLogList()
  },
  methods: {
    // 获取服务概览数据
    async getDashboardData() {
      this.loading = true
      try {
        const { data: res } = await getChartData()
        this.loading = false

        if (res.code !== 1) return
        const obj = res.data || {}

        // 用户信息
        this.userinfo = {
          ...this.userinfo,
          ...obj.user_info
        }

        // 资产余额信息
        this.propertyInfo.total = (obj.user_recharge_sum || {}).rechargeSum || 0
        this.propertyInfo.propertyBalance = this.userinfo.propertyBalance || 0

        // 我的域名统计
        this.countDomain.domain = obj.domain_sum || 0
        this.countDomain.domainErr = obj.domain_err_sum || 0
        this.countDomain.monitor = obj.m_task_sum || 0
        this.countDomain.httpdns = obj.http_dns_sum || 0
        this.countDomain.ptr = obj.ptr_sum || 0

        // 我的套餐统计
        this.countPlan.total = obj.consume_total || 0
        this.countPlan.used = obj.consume_in_used || 0
        this.countPlan.expired = obj.consume_time_out || 0
        const { total, used, expired } = this.countPlan
        this.countPlan.unused = total - used - expired
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 获取用户登录日志
    async getLogList() {
      const { data: res } = await getLogList({
        user_type: 2,
        log_type: 0,
        page: 1,
        limit: 1
      })
      if (res.code !== 1) return
      this.loginLog = (res.data || {}).list[0] || {}
    },

    // 点击搜索域名
    searchDomain() {
      if (!this.domain) {
        return this.$msg.error('请输入域名进行搜索')
      }
      this.$router.push({
        name: 'DomainList',
        query: {
          domain: this.domain
        }
      })
    },

    // 前往实名认证页面
    toVerify() {
      if (!this.isShowVerify) return
      this.$router.push('/dns/account/verification')
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-tag {
  color: #fefefe;
  background-color: #00c878;
  padding: 5px 10px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
}
.error-auth-tag.auth-tag {
  background-color: #f52443;
  &:hover {
    box-shadow: 0px 1px 6px 0px rgba(245, 36, 67, 0.6);
  }
}
.price-auth-tag.auth-tag {
  background-color: #fff;
  color: theme('colors.price');
  border: 1px solid theme('colors.price');
  &:hover {
    box-shadow: 0px 1px 6px 0px rgba(255, 122, 34, 0.6);
  }
}
.ants-search_input {
  @media screen and (max-width: 500px) {
    width: 160px;
  }
}
</style>

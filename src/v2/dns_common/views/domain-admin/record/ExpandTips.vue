<template>
  <div class="record-expand-tips relative bg-ants-bg-5 text-ants-text-1">
    <span
      class="el-icon-caret-top tips-top-icon absolute text-ants-bg-5 "
      :style="'left:' + expandTips.spanLeft + 'px'"
    ></span>

    <div class="font-bold">
      {{ expandTips.title }}
    </div>

    <ul class="mt-sm">
      <li
        class="flex"
        style="line-height: 34px;"
        v-for="item in expandTips.tipsArr"
        :key="item.name"
      >
        <span
          class="inline-block text-primary cursor-pointer"
          style="width: 90px;"
          >{{ item.name }}</span
        >
        <div>{{ item.info }}</div>
      </li>
    </ul>

    <span
      class="absolute text-primary cursor-pointer"
      style="top: 20px;right:40px;"
      @click="hideExpandTips"
      >{{ antsT('隐藏提示') }} <i class="el-icon-caret-top"></i
    ></span>
  </div>
</template>

<script>
let expandTipsObj = {}

export default {
  data() {
    return {
      // 当前消息
      expandTips: {}
    }
  },
  created() {
    this.init()
  },
  mounted() {},
  methods: {
    /**
     * @description: 当前显示的提示信息
     */

    getExpandTips(key = 'top', spanLeft = '162') {
      this.expandTips = expandTipsObj[key]
      this.expandTips.spanLeft = spanLeft
    },

    // 隐藏展开行信息
    hideExpandTips() {
      this.$emit('hideExpandTips')
    },

    /**
     * @description: 获取当前对应展开的提示信息
     */

    init() {
      // 当前解析域名
      const domain = this.$route.params.domain || 'domain.com'
      expandTipsObj = {
        // 主机记录
        top: {
          spanLeft: '12%',
          title: '主机记录相当于域名前缀，比如www，常见用法有：',
          tipsArr: [
            {
              name: 'www',
              info: '解析后的域名为 www.' + domain
            },
            {
              name: '@',
              info: '直接解析主域名 ' + domain
            },
            {
              name: '*',
              info: '泛解析，匹配其他所有域名 *.' + domain
            },
            {
              name: 'mail',
              info: '将域名解析为 mail.' + domain + '，通常用于邮件服务器'
            },
            {
              name: '二级域名',
              info: '如：abc.' + domain + '，请填写 abc'
            },
            {
              name: '手机网站',
              info: '如：m.' + domain + '，请填写 m'
            }
          ]
        },
        // 记录类型
        record_type: {
          spanLeft: '24.5%',
          title: '各个记录类型有不同的用途，一般选择 A 记录：',
          tipsArr: [
            {
              name: 'A',
              info:
                'A 记录是最常用类型，将域名指向一个 IPv4 地址（如：8.8.8.8）'
            },
            {
              name: 'CNAME',
              info:
                '如果需要将域名指向另一个域名，再由另一个域名提供ip地址，就需要添加 CNAME 记录'
            },
            {
              name: 'MX',
              info:
                '如果需要设置邮箱，让邮箱能收到邮件，就需要添加MX记录。相关参数一般由邮件注册商提供'
            },
            {
              name: 'TXT',
              info:
                '在这里可以填写任何东西，长度限制255。绝大多数的TXT记录是用来做SPF记录（反垃圾邮件）'
            },
            {
              name: 'NS',
              info:
                '域名服务器记录，如果需要把子域名交给其他DNS服务商解析，就需要添加NS记录'
            },
            {
              name: 'AAAA',
              info: '将域名指向一个 IPv6 地址，如 ff06:0:0:0:0:0:0:c3'
            },
            {
              name: 'SPF',
              info: '用于指定发送邮件的服务器，是一种高效的反垃圾邮件解决方案'
            },
            {
              name: 'SVR',
              info:
                '记录了哪台计算机提供了哪个服务。格式为：服务的名字、点、协议的类型，例如：_xmpp-server._tcp'
            },
            {
              name: 'CAA',
              info: '用于指定域名的证书颁发机构（CA），减少证书颁发风险'
            },
            {
              name: '显性URL',
              info:
                '将一个域名重定向至某个具体网页，且显示实际 URL 。仅支持 301 重定向，该记录要求双方域名均已完成备案'
            },
            {
              name: '隐性URL',
              info:
                '将一个域名重定向至某个具体网页，但隐藏实际 URL 。仅支持 301 重定向，该记录要求双方域名均已完成备案'
            }
          ]
        },
        // 线路类型
        line: {
          spanLeft: '37.5%',
          title:
            '支持按多种方式划分线路，让指定用户访问该记录，升级套餐还可增加线路选项',
          tipsArr: [
            {
              name: '默认',
              info:
                '默认线路，一般情况下保留默认即可，每一条记录必须保证已有默认线路才可正常解析'
            },
            {
              name: '联通',
              info:
                '运营商线路，可为联通用户单独指定一个记录值，其他用户则仍然访问默认线路'
            },
            {
              name: '搜索引擎',
              info: '可指定一个服务器 IP 专用于搜索引擎抓取'
            }
          ]
        },
        // 记录值
        value: {
          spanLeft: '51.5%',
          title:
            '请根据您选择的记录类型，按照格式要求填写记录值，请参考如下所示',
          tipsArr: [
            {
              name: 'A记录',
              info: '您选择的是 A 记录，请在此填写服务器 IP 地址，如 8.8.8.8'
            },
            {
              name: 'CNAME记录',
              info: '填写中间商给您提供的域名，例如：testdns.com'
            },
            {
              name: 'MX记录',
              info:
                '填写企业邮局给您提供的域名或者服务器IP，如果您不知道，请咨询您的邮件服务提供商'
            },
            {
              name: 'TXT记录',
              info: '一般用于 Google、QQ等企业邮箱的反垃圾邮件设置'
            },
            {
              name: 'NS记录',
              info:
                '不常用。系统默认添加的两个NS记录请不要修改。NS向下授权，填写dns域名，例如：ns1.testdns.com'
            },
            {
              name: 'AAAA',
              info: '不常用。解析到 IPv6 的地址'
            },
            {
              name: 'SRV',
              info:
                '不常用。格式为：优先级、空格、权重、空格、端口、空格、主机名。例如：1 1 8686 your-server.l.google.com'
            },
            {
              name: 'CAA',
              info:
                // '格式为：flag tag domainue。 其中flag目前取值为0-128；tag取值为issue、issuewild、iodef；domainue为CA的域名或用于违规通知的电子邮箱。例如：12 iodef www.testdns.com'
                '格式为：domainue。domainue为CA的域名或用于违规通知的电子邮箱。例如：www.testdns.com'
            }
          ]
        },
        // 权重
        weight: {
          spanLeft: '58%',
          title:
            '同一条线路下的多条记录，可按照指定权重比例返回，支持 A、CNAME、AAAA 记录',
          tipsArr: [
            {
              name: '类型限制',
              info: 'A、CNAME、AAAA'
            },
            {
              name: '权重值区间',
              info: '1 ~ 10的整数，数字越大权重值越高'
            },
            {
              name: '权重设为0',
              info: '表示关闭该线路下所有记录的权重'
            },
            {
              name: 'MX 优先级',
              info: '1 ~ 10的整数，数值越高优先级越大'
            }
          ]
        },
        // MX 优先级
        mx: {
          spanLeft: '64%',
          title: 'MX 优先级：数值越低、优先级别就越高',
          tipsArr: [
            {
              name: 'MX 值',
              info: '1 ~ 55的整数'
            }
          ]
        },
        // TTL
        ttl: {
          spanLeft: '72%',
          title:
            'TTL 指解析记录在 DNS 服务器缓存的生存时间，数值越小则生效越快',
          tipsArr: [
            {
              name: '600',
              info: '一般默认值，如不了解请保留 600 秒即可'
            },
            {
              name: '3600',
              info: '当记录值较少变动时，建议选择 3600 秒，有利于提升解析速度'
            },
            {
              name: '60',
              info: '当记录值频繁变动，可选择 60 秒，但解析速度可能略受影响'
            }
          ]
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.record-expand-tips {
  padding: 20px 20px 15px;
  margin-top: -1px;
  font-size: 13px;

  .tips-top-icon {
    font-size: 30px;
    top: -18px;
    left: 156px;
  }
}
</style>

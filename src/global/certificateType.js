// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getDnsApiAll } = require(`@/v2/${PROCESS_NAME}/api/cdn/dns`)
const isAdmin = PROCESS_NAME === 'cdn_admin'

export const certificateType = isAdmin
  ? [
      { value: 3, name: 'Letsencrypt', tip: '', isDnsFlag: false },
      { value: 5, name: 'ZeroSSL', tip: '', isDnsFlag: false }
    ]
  : [
      { value: 3, name: 'Letsencrypt', tip: '', isDnsFlag: false },
      { value: 5, name: 'ZeroSSL', tip: '', isDnsFlag: false },
      {
        value: 4,
        name: '* 通配符 letsencrypt',
        tip: '(确认域名DNS已转入)',
        isDnsFlag: true
      },
      {
        value: 6,
        name: '* 通配符 Zerossl',
        tip: '(确认域名DNS已转入)',
        isDnsFlag: true
      }
    ]

export const getDnsApiData = async () => {
  const { data: res } = await getDnsApiAll()
  let dnsApiData = []
  dnsApiData = res.data.data.map((item) => {
    return {
      name: `${item.source == 'antsdns' ? 'SD' : item.source}-${
        item.appDomain
      }`,
      id: item.id
    }
  })
  return dnsApiData
}

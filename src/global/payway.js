export default {
  alipay: {
    name: '支付宝',
    title: '支付宝扫码支付',
    icon: 'aicon icon-zhifubao',
    color: '#02A9F1',
    info: '打开手机支付宝，扫一扫进行支付',
    logo: require('@/assets/img/alipay-icon.png')
  },
  wechat: {
    name: '微信支付',
    title: '微信扫码支付',
    icon: 'aicon icon-weixinzhifu',
    color: '#09BB07',
    info: '打开手机微信，扫一扫进行支付',
    logo: require('@/assets/img/wechat-icon.png')
  },

  // stripe 支付，已经取消该支付
  stripe: {
    name: '支付宝',
    title: '支付宝扫码支付',
    icon: 'aicon icon-zhifubao',
    color: '#02A9F1',
    info: '打开手机支付宝，扫一扫进行支付',
    logo: require('@/assets/img/alipay-icon.png')
  },
  stripe_other: {
    name: '在线支付',
    title: '在线支付',
    icon: 'aicon icon-saomazhifu1',
    color: '#FF7A22',
    info: '支持世界各地的线上支付方式',
    logo: require('@/assets/img/stripe.svg')
  },
  // stripe_wechat: {
  //   name: '网银支付',
  //   icon: 'aicon icon-wangyinzhifu',
  //   color: '#E40915',
  //   info: '打开手机微信，扫一扫进行支付'
  // },
  // stripe_apple: {
  //   name: 'Apple Pay',
  //   icon: 'aicon icon-apple-pay',
  //   color: '#303133',
  //   info: '基于NFC的手机支付功能'
  // },

  // 通联支付
  allinpay: {
    name: '支付宝',
    title: '支付宝扫码支付',
    icon: 'aicon icon-zhifubao',
    color: '#02A9F1',
    info: '打开手机支付宝，扫一扫进行支付',
    logo: require('@/assets/img/alipay-icon.png')
  },
  allinpay_wechat: {
    name: '微信支付',
    title: '微信扫码支付',
    icon: 'aicon icon-weixinzhifu',
    color: '#09BB07',
    info: '打开手机微信，扫一扫进行支付',
    logo: require('@/assets/img/wechat-icon.png')
  },

  tokenpay: {
    name: 'USDT-TRC20',
    title: 'USDT-TRC20扫码支付',
    icon: 'aicon icon-USDT',
    color: '#1BA27A',
    info: '使用加密货币USDT-TRC20付款',
    logo: require('@/assets/img/usdt.png')
  },
  tokenpay_ERC20: {
    name: 'USDT-ERC20',
    title: 'USDT-ERC20扫码支付',
    icon: 'aicon icon-USDTERC20',
    color: '#26A17B',
    info: '使用加密货币USDT-ERC20付款',
    logo: require('@/assets/img/erc20.png')
  },
  tokenpay_ETH: {
    name: 'ETH',
    title: 'ETH扫码支付',
    icon: 'aicon icon-yitaifang',
    color: '#3E5BF2',
    info: '使用加密货币ETH付款',
    logo: require('@/assets/img/eth.png')
  },
  // 已取消该支付方式
  tokenpay_TRX: {
    name: 'TRX',
    title: 'TRX扫码支付',
    info: '使用加密货币TRX付款',
    icon: 'aicon icon-trx',
    color: '#E40915',
    logo: require('@/assets/img/trx.png')
  },

  // 彩虹易支付
  cccyun_wxpay: {
    name: '微信支付',
    title: '微信扫码支付',
    icon: 'aicon icon-weixinzhifu',
    color: '#09BB07',
    info: '打开手机微信，扫一扫进行支付',
    logo: require('@/assets/img/wechat-icon.png')
  },
  cccyun: {
    name: '支付宝',
    title: '支付宝扫码支付',
    icon: 'aicon icon-zhifubao',
    color: '#02A9F1',
    info: '打开手机支付宝，扫一扫进行支付',
    logo: require('@/assets/img/alipay-icon.png')
  },
  cccyun_qqpay: {
    name: 'QQ钱包',
    title: 'QQ钱包扫码支付',
    icon: 'aicon icon-icon',
    color: '#0054FE',
    info: '打开QQ钱包，扫一扫进行支付',
    logo: require('@/assets/img/wechat-icon.png')
  }
}

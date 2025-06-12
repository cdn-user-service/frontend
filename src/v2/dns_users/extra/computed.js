import Vue from 'vue'
import router from '../router'

/**
 * @description: 是否未实名、计算是否需要显示强制实名认证
 */
export function isUnverified({ $root }) {
    // 用户是否实名认证
    const { realnameStatus } = $root.userinfo
    // 后台是否开启强制实名认证
    const { realName } = $root.webConfig.power

    // 返回 true 则显示强制实名认证对话框
    return realName == 1 && realnameStatus == 0
}

/**
 * @description: 是否未绑定手机号、计算是否需要强制绑定手机号
 * @return {*}
 */
export function isUnboundMobile({ $root, $route }) {
    // 用户是否已绑定手机号
    const { mobile } = $root.userinfo
    // 后台是否开启强制绑定手机号
    const { bindMobile } = $root.webConfig.power

    // 需要显示绑定手机号的页面
    const needShowPage = $route.meta.bindMobile
    // 返回 true 则表示需要提示强制绑定手机号
    return needShowPage && bindMobile == 1 && !mobile
}

/**
 * @description: 提示前往实名、绑定手机号
 */
export function showTipsAlert({
    isUnverified = false,
    isUnboundMobile = false,
    tag = ''
}) {
    // 提示实名认证
    if (isUnverified) {
        Vue.prototype.$alert(
            `温馨提示：您需要先进行 实名认证 才能${tag}，立即前往进行实名认证？`,
            '您还未实名认证',
            {
                center: true,
                type: 'info',
                confirmButtonText: '立即前往',
                callback: action => {
                    if (action === 'confirm') {
                        router.push('/dns/account/verification')
                    }

                    if (action === 'cancel') {
                        Vue.prototype.$msg.info('已取消前往实名认证！')
                    }
                }
            }
        ).catch(err => err)
        return true
    }

    // 提示绑定手机号
    if (isUnboundMobile) {
        Vue.prototype.$alert(
            `温馨提示：根据相关规定，您需要 绑定手机号 才能${tag}，立即前往绑定手机号？`,
            '您需要绑定手机号',
            {
                center: true,
                type: 'info',
                confirmButtonText: '立即前往',
                callback: action => {
                    if (action === 'confirm') {
                        router.push('/dns/account/info')
                    }

                    if (action === 'cancel') {
                        Vue.prototype.$msg.info('已取消前往绑定手机号！')
                    }
                }
            }
        ).catch(err => err)
        return true
    }
    return false
}

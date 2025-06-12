<template>
    <div class="flex items-center absolute top-0 right-0 z-50" >
        <div class="flex items-center relative">
            <div style="color:#177DFF;font-size:14px;font-weight:500;padding-right:2px" class="absolute left-0 right-0 text-center">
                {{ antsT((type === 'MailMobileForm' ? '微信扫码' : '账号密码') + name) }}
            </div>
                <svg width="113" height="32" viewBox="0 0 113 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4 0C1.79086 0 0 1.79086 0 4V28C0 30.2091 1.79086 32 4 32H104C106.209 32 108 30.2091 108 28V23.4482C108 22.5125 108.328 21.6063 108.927 20.8875L111.933 17.2804C112.551 16.5387 112.551 15.4613 111.933 14.7196L108.927 11.1125C108.328 10.3937 108 9.48755 108 8.5518V4C108 1.79086 106.209 0 104 0H4Z" fill="#F0F6FF"></path>
</svg>
        </div>  

        <div class="relative toggle-icon-box flex items-center justify-center cursor-pointer"
          v-if="type === 'MailMobileForm'"
         @click="toggleType('WxLoginCode')">

 <!-- 扫码图标 -->
<span><svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.1902 3.23803H3.23803V16.1902H16.1902V3.23803ZM0 0V19.4282H19.4282V0H0Z" fill="#177DFF"></path>
<path fill-rule="evenodd" clip-rule="evenodd" d="M30.762 3.23803H25.4688V8.30874H30.762V3.23803ZM22.2308 0V11.5468H34V0H22.2308Z" fill="#177DFF"></path>
<path d="M22.2308 17.9629H26.1538V23.7363H22.2308V17.9629Z" fill="#177DFF"></path>
<path d="M26.1538 21.811H30.0769V25.66H26.1538V21.811Z" fill="#177DFF"></path>
<path d="M22.2308 25.6592H26.1538V29.5081H22.2308V25.6592Z" fill="#177DFF"></path>
<path d="M30.077 25.6592H34V29.5081H30.077V25.6592Z" fill="#177DFF"></path>
<path d="M30.077 17.9629H34V23.7363H30.077V17.9629Z" fill="#177DFF"></path>
<path d="M4.85705 4.85693H14.5711V14.571H4.85705V4.85693Z" fill="#177DFF"></path>
<path d="M22.2308 13.4707H26.1538V16.0367H22.2308V13.4707Z" fill="#177DFF"></path>
<path d="M30.077 13.4707H34V16.0367H30.077V13.4707Z" fill="#177DFF"></path>
<path d="M22.2308 31.4331H34V33.9991H22.2308V31.4331Z" fill="#177DFF"></path>
</svg>
</span>
        </div>

        <div class="relative toggle-icon-box flex items-center justify-center cursor-pointer"
          v-if="type === 'WxLoginCode'"
         @click="toggleType('MailMobileForm')">
         <!-- 手机图标 -->
<span><svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M33 6.41675H11C10.4937 6.41675 10.0833 6.82715 10.0833 7.33342V36.6667C10.0833 37.173 10.4937 37.5834 11 37.5834H33C33.5063 37.5834 33.9167 37.173 33.9167 36.6667V7.33341C33.9167 6.82715 33.5063 6.41675 33 6.41675ZM11 3.66675C8.97496 3.66675 7.33334 5.30837 7.33334 7.33342V36.6667C7.33334 38.6918 8.97496 40.3334 11 40.3334H33C35.025 40.3334 36.6667 38.6918 36.6667 36.6667V7.33341C36.6667 5.30837 35.025 3.66675 33 3.66675H11Z" fill="#177DFF"></path>
<path d="M12.8333 9.16675H31.1667V28.4167H12.8333V9.16675Z" fill="#177DFF"></path>
<path d="M24.2917 32.9999C24.2917 34.2656 23.2657 35.2916 22 35.2916C20.7343 35.2916 19.7083 34.2656 19.7083 32.9999C19.7083 31.7343 20.7343 30.7083 22 30.7083C23.2657 30.7083 24.2917 31.7343 24.2917 32.9999Z" fill="#177DFF"></path>
</svg>
</span>
        </div>
  </div>
</template>

<script>
export default {
    props: {
        name: {
            type: String,
            default: '登录'
        }
    },
    data() {
        return {
            // 与实际的登录方式相反，微信登录 = WxLoginCode， 账号登录 = MailMobileForm
            type: 'MailMobileForm'
        }
    },
    methods: {
        toggleType(type) {
            this.type = type
            this.$emit('change', type)
        }
    }
}
</script>

<style lang="scss" scoped>
.toggle-icon-box {
    height: 60px;
    width: 60px;
    background-color: #F0F6FF;
    border-radius: 0 10px 0 0;
    &::before {
        position: absolute;
    top: 0;
    left: 0;
    display: block;
    content: " ";
    border: 30px solid;
    border-color: transparent transparent #fefefe #fefefe;
    }
}
</style>

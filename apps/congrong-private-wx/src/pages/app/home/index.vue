<script lang="ts" setup>
import { useWxService } from '@/services/wx'
import { useInfoStore } from '@/stores/useInfo'
import { useToast } from 'wot-design-uni'

const deviceId = ref('')
const infoStore = useInfoStore()
const wxService = useWxService()
const { success: showSuccess, error: showError } = useToast()
const wxLoginInfo = ref<{
  session_key?: string
  openid?: string
  unionid?: string
}>({})

const model = reactive<{
  nickname: string
  phone: string
}>({
  nickname: '',
  phone: '',
})

const form = ref()

onLoad((query) => {
  const scene = decodeURIComponent(query?.scene)

  // 解析场景值中的 device_id 参数
  if (scene) {
    // 假设场景值格式为 device_id=123 或 device_id=123&param2=value2
    const params = scene.split('&')
    for (const param of params) {
      const [key, value] = param.split('=')
      if (key === 'device_id') {
        deviceId.value = value
        break
      }
    }
  }
  // 页面加载时自动登录微信
  handleWxLogin()
})

// 从infoStore读取存储的昵称和手机号
onShow(() => {
  if (infoStore.nickname) {
    model.nickname = infoStore.nickname
  }

  if (infoStore.phoneNumber) {
    model.phone = infoStore.phoneNumber
  }
})

// 微信登录
async function handleWxLogin() {
  try {
    // 调用微信登录获取code
    const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          if (res.code) {
            resolve(res)
          }
          else {
            reject(new Error('登录失败'))
          }
        },
        fail: (err) => {
          reject(err)
        },
      })
    })

    // 将code发送到后端换取用户信息
    const wxLoginResult = await wxService.wxLogin(loginResult.code)

    // 保存登录结果
    wxLoginInfo.value = wxLoginResult

    // 存储openid到本地
    uni.setStorageSync('openid', wxLoginResult.openid)

    console.log('登录成功，用户信息:', wxLoginResult)
  }
  catch (error: any) {
    showError({ msg: error?.message || '微信登录失败' })
    console.error('微信登录失败:', error)
  }
}

// 获取用户手机号
async function getPhoneNumber(e: any) {
  try {
    if (e.errMsg !== 'getPhoneNumber:ok') {
      showError({ msg: '用户拒绝授权获取手机号' })
      return
    }

    const code = e.code
    if (!code) {
      showError({ msg: '获取授权码失败' })
      return
    }

    uni.showLoading({ title: '获取手机号中...' })

    // 调用服务端API获取手机号，如果有openid可以一并传递
    const res = await wxService.getPhoneNumber(code, wxLoginInfo.value.openid)

    uni.hideLoading()

    if (res.phoneNumber) {
      // 仅使用不含国家代码的手机号
      const phone = res.purePhoneNumber
      model.phone = phone

      // 保存到store中
      infoStore.setPhoneNumber(phone)
      showSuccess({ msg: '获取手机号成功' })
    }
  }
  catch (error: any) {
    uni.hideLoading()
    console.error('获取手机号出错:', error)
  }
}

function handleSubmit() {
  form.value
    .validate()
    .then(async ({ valid, errors }: { valid: unknown, errors: unknown }) => {
      if (valid) {
        // 提交时同时保存到store
        infoStore.setUserInfo({
          nickname: model.nickname,
          phoneNumber: model.phone,
        })

        showSuccess({
          msg: '提交成功，信息已保存',
        })
      }
      else {
        console.log(errors, 'validation errors')
      }
    })
    .catch((error: unknown) => {
      console.log(error, 'error')
    })
}
</script>

<template>
  <view class="page">
    <wd-form ref="form" :model="model">
      <wd-cell-group border>
        <wd-input
          v-model="model.nickname"
          label="名字"
          label-width="100px"
          prop="nickname"
          clearable
          placeholder="请输入名字"
          :rules="[{ required: true, message: '请输入名字' }]"
        >
          <!-- <template #suffix>
            <wd-button size="small" type="primary" open-type="getUserInfo" @getuserinfo="getNickname">
              获取昵称
            </wd-button>
          </template> -->
        </wd-input>
        <wd-input
          v-model="model.phone"
          label="手机号"
          label-width="100px"
          prop="phone"
          clearable
          placeholder="请获取手机号"
          :rules="[{ required: true, message: '请获取手机号' }]"
          disabled
        >
          <template #suffix>
            <wd-button size="small" type="primary" open-type="getPhoneNumber" :disabled="!!model.phone" @getphonenumber="getPhoneNumber">
              点击获取号码
            </wd-button>
          </template>
        </wd-input>
      </wd-cell-group>
      <view class="px-4 py-10 text-center text-xs text-gray-400">
        <view>设备编号：{{ deviceId || '未检测到' }}</view>
        <view>您提供的信息仅用于生成个性化检查报告</view>
        <wd-button custom-class="mt-2 " type="primary" size="large" block @click="handleSubmit">
          提交
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

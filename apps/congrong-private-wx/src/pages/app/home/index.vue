<script lang="ts" setup>
import { useInfoStore } from '@/stores/useInfo'
import { useToast } from 'wot-design-uni'

const deviceId = ref('')
const infoStore = useInfoStore()

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
})

const model = reactive<{
  nickname: string
  phone: string
}>({
  nickname: '',
  phone: '',
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

const { success: showSuccess } = useToast()

const form = ref()

// 获取用户昵称
function onGetUserInfo(e: unknown) {
  console.log('用户信息', e)
}

// 获取用户手机号
function onGetPhoneNumber(e: unknown) {
  console.log('手机号', e)
}

function handleSubmit() {
  form.value
    .validate()
    .then(({ valid, errors }: { valid: unknown, errors: unknown }) => {
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
          label="昵称"
          label-width="100px"
          prop="value1"
          clearable
          placeholder="请获取用户名"
          :rules="[{ required: true, message: '请获取用户名' }]"
          disabled
        >
          <template #suffix>
            <wd-button size="small" type="primary" open-type="getUserInfo" @getuserinfo="onGetUserInfo">
              获取昵称
            </wd-button>
          </template>
        </wd-input>
        <wd-input
          v-model="model.phone"
          label="手机号"
          label-width="100px"
          prop="value2"
          clearable
          placeholder="请获取手机号"
          :rules="[{ required: true, message: '请获取手机号' }]"
          disabled
        >
          <template #suffix>
            <wd-button size="small" type="primary" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
              获取号码
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

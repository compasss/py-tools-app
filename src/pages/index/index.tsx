import {ITouchEvent, View} from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {

  useLoad(() => {
    console.log('Page loaded.')
  })

  function handleClick(path: string, ev: ITouchEvent){
      Taro.navigateTo({
          url: path
      })
  }

  return (
    <View className='app-list'>
        <View className='app-item' onClick={event => handleClick('/pages/bqb/bqb', event)}>表情包</View>
        <View className='app-item'>门禁</View>
    </View>
  )
}

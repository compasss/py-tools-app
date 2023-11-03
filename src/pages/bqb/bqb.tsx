import { View, ScrollView, Picker, ITouchEvent, Image, Text } from '@tarojs/components'
import { AtList, AtListItem } from 'taro-ui'
import { useState } from "react";
import Taro, { useLoad, useReady } from '@tarojs/taro'
import AtSearchBar from '@/components/search-bar/search-bar'
import './bqb.scss'

export default function Bqb() {

  const [categoryList, setCategoryList] = useState([])
  const [category, setCategory] = useState('')
  const [searchStr, setSearchStr] = useState('')
  const [page, setPage] = useState(1)
  const [lock, setLock] = useState(false)
  const [noMore, setNoMore] = useState(false)
  const [scrollHigh, setScrollHigh] = useState(200)
  const [imageList, setImageList] = useState([])

  useLoad(() => {
    getCategoryList()
    getImageList();
  })

  useReady(() => {
    // 初次渲染时，在小程序触发 onReady 后，才能获取小程序的渲染层节点
    Taro.createSelectorQuery()
      .select('#search-row')
      .boundingClientRect()
      .exec(res => {
        let systemInfo = Taro.getSystemInfoSync()
        setScrollHigh(systemInfo.windowHeight - res[0].height)
      })
  })

  async function getCategoryList(): Promise<void> {
    const res = await Taro.request({
      url: `${process.env.TARO_APP_API_URL}/bqb/category-list`
    })
    setCategoryList(res.data)
  }

  async function getImageList(more?: boolean): Promise<void> {
    setLock(true)
    Taro.showLoading({
      title: '加载中',
    })
    let query: ImageReq = {
      page: more ? page + 1 : 1,
      pageSize: 20
    }
    if (searchStr) {
      query.str = searchStr
    }
    if (category) query.category = category;
    const res = await Taro.request({
      url: `${process.env.TARO_APP_API_URL}/bqb/search-image`,
      data: query
    })
    if (res.statusCode == 200) {
      let data = []

      if (more) {
        setPage(page + 1)
        data = imageList.concat(res.data.data)
      } else {
        setPage(1)
        data = res.data.data
      }
      setImageList(data)
      if (page * 20 >= res.data.totalRecords) {
        setNoMore(true)
      }
    }
    setLock(false)
    Taro.hideLoading()
  }

  function pickerChange(ev: ITouchEvent): void {
    setCategory(categoryList[ev.detail.value])
  }

  function strChange(str: string): void {
    setSearchStr(str.trim())
  }

  function clearSearchStr(): void {
    setSearchStr('')
  }

  function handleSearch(): void {
    setPage(1)
    getImageList()
  }

  function handleScrollToLower(): void {
    console.log(page)
    if (!lock && !noMore) {
      setPage(page + 1)
      getImageList(true)
    }
  }

  function showPicture(_ev: ITouchEvent, url:string) :void {
    let images:Array<string> = imageList.map((it: BqbItem) => `${process.env.TARO_APP_QINIU_URL}/${it.url}`)
    Taro.previewImage({
      current: `${process.env.TARO_APP_QINIU_URL}/${url}`, // 当前显示图片的http链接
      urls: images // 需要预览的图片http链接列表
    })
  }


  return (
    <View className='bqb-page'>
      <View className='search-row' id='search-row'>
        <Picker mode='selector' range={categoryList} onChange={pickerChange}>
          <AtList>
            <AtListItem title='分类' extraText={category||'请选择'} arrow='right' />
          </AtList>
        </Picker>
        <AtSearchBar showActionButton inputType='text' value={searchStr} onChange={strChange} onClear={clearSearchStr} onActionClick={handleSearch} />
      </View>
      <ScrollView style={{'height': scrollHigh}} scrollY scrollWithAnimation enableBackToTop onScrollToLower={handleScrollToLower}>
        <View className='bqb-list'>
          {imageList.map((item: BqbItem) => {
            return (
              <View className='bqb-item' key={item.id} onClick={event => showPicture(event, item.url)}>
                <Image src={'https://q.265265.xyz/' + item.url} className='bqb-img' />
                <Text className='bqb-txt'>{item.name}</Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
      {noMore && <View className='no-more'>no more</View>}
    </View>
  )
}

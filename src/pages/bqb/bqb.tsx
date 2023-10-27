import { View, ScrollView, Picker, ITouchEvent, Image, Text } from '@tarojs/components'
import { AtSearchBar, AtList, AtListItem } from 'taro-ui'
import { useState } from "react";
import Taro, { useLoad, useReady } from '@tarojs/taro'
import './bqb.scss'


export default function Bqb() {

    const [categoryList, setCategoryList] = useState([])
    const [category, setCategory] = useState('')
    const [searchStr, setSearchStr] = useState('')
    const [page, setPage] = useState(1)
    const [lock, setLock] = useState(false)
    const [noMore, setNoMore] = useState(false)
    const [scrollHigh, setScrollHigh] = useState(200)

    useLoad(() => {
        getCategoryList();
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

    async function getCategoryList(more: boolean): Promise<void> {
        setLock(true)
        let query = {
            page: page,
            pageSize: 20
        }
        if (searchStr) {
            query.str = searchStr
        }
        const res = await Taro.request({
            url: 'https://fun.xiguayun.cn:8005/bqb/search-image',
            data: query
        })
        if (res.statusCode == 200) {
            let data = []
            data = more ? categoryList.concat(res.data.data) : res.data.data
            console.log(data)
            setCategoryList(data)
            if (page * 20 >= res.data.totalRecords) {
                setNoMore(true)
            }
        }
        setLock(false)
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
        setCategoryList([])
        getCategoryList()
    }

    function handleScrollToLower(): void {
        console.log(page)
        if (!lock && !noMore) {
            setPage(page + 1)
            getCategoryList(true)
        }
    }


    return (
        <View className='bqb-page'>
            <View className='search-row' id='search-row'>
                <Picker mode='selector' range={categoryList} onChange={pickerChange}>
                    <AtList>
                        <AtListItem title='分类' extraText={category} />
                    </AtList>
                </Picker>
                <AtSearchBar showActionButton value={searchStr} onChange={strChange} onClear={clearSearchStr} onActionClick={handleSearch} />
            </View>
            <ScrollView style={{'height': scrollHigh}} className='bqb-list' scrollY scrollWithAnimation enableBackToTop onScrollToLower={handleScrollToLower}>
                { categoryList.map(item => {
                    return (
                        <View className='bqb-item' key={item.id}>
                            <Image src={'https://q.265265.xyz/'+item.url} className='bqb-img' />
                            <Text className='bqb-txt'>{item.name}</Text>
                        </View>
                    )
                })}
            </ScrollView>
            { noMore && <View className='no-more'>no more</View>}
        </View>
    )
}

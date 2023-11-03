interface ImageReq {
  page: number,
  pageSize: number,
  str?: string | number,
  category?: string | number
}

interface BqbItem {
  id?: number,
  name: string,
  fileName: string,
  url: string,
  category: string,
  createAt: Date,
  modifyAt: Date
}

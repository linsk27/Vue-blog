import { IArticleParams, IArticle } from './interface'
import { ARTICLE_CREATE, ARTICLE_DETAIL, ARTICLE_UPDATE, ARTICLE_LIST, ARTICLE_DELETE } from './url.const'
import http from '@/api'

const articleApi = {
    create: (params: IArticleParams) => {
        return http.post<{ id: number; title: string }>(ARTICLE_CREATE, params)
    },
    update: (id: number | string, params: IArticleParams) => {
        return http.put(ARTICLE_UPDATE(id), params)
    },
    delete: (id: number | string) => {
        return http.delete(ARTICLE_DELETE(id))
    },
    getDetail: (id: number | string) => {
        return http.get<IArticle>(ARTICLE_DETAIL(id))
    },
    getList: (params?: any) => {
        return http.get<IArticle[]>(ARTICLE_LIST, params)
    }
}

export default articleApi

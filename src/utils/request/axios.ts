import axios, { type AxiosResponse } from 'axios'

/**
 * 封装service，设置基础URL,为/api，走代理过跨域
 */
const service = axios.create({
})


/**
 * 设置拦截器,在请求之前处理
 */
service.interceptors.request.use(
    (config)=>{
        //设置请求头参数
        return config
    },
    (error)=>{
        return Promise.reject(error.response)
    }
)

/**
 * 设置拦截器，请求返回的时候处理
 */
service.interceptors.response.use(
    (Response : AxiosResponse) : AxiosResponse =>{
        if(Response.status === 200 || Response.status === 201){
            return Response
        } 
        throw new Error(Response.status.toString());        
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default service
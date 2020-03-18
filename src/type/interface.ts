// 数据库相关的配置文件
export interface conf {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    
    acquireTimeout?: number,
    waitForConnections?: boolean, //是否等待链接  
    connectionLimit?: number, // 连接池数
    queueLimit?: number,  // 排队限制 
    
    isDebug?: boolean,
    isPool?: boolean,
    defaultSqlPre?: string,
}

export interface sqlObj {
    queryType?: string,
    table?: string,
    where?: string | object,
    field?: string,
    alias?: string,
    data?: string | object,
    order?: string,
    limit?: string,
    page?: string,
    group?: string,
    having?: string,
    union?: string,
    distinct?: string,
    lock?: string,
    comment?: string,
    count?: string,
    max?: string,
    min?: string,
    avg?: string,
    sum?: string,
    join?: Object,

    select?: string,
    update?: string,
    insert?: string,
    delete?: string,
    query?: string,

    sqlStr?: string
}

export interface tempObj extends sqlObj{}

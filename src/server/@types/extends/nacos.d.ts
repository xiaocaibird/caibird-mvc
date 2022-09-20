/**
 * @Owners cmZhou
 * @Title nacos 扩展
 */
declare module 'nacos' {
    type HostInfo = {
        valid: boolean,
        marked: boolean,
        metadata: {
            side: string,
            methods: string,
            release: string,
            deprecated: string,
            module: string,
            dubbo: string,
            loadbalance: string,
            threads: string,
            pid: string,
            interface: string,
            threadpool: string,
            version: string,
            timeout: string,
            generic: string,
            revision: string,
            path: string,
            retries: string,
            protocol: string,
            application: string,
            dynamic: string,
            category: string,
            anyhost: string,
            group: string,
            timestamp: string,
        },
        instanceId: string,
        port: number,
        healthy: boolean,
        ip: string,
        clusterName: string,
        weight: number,
        ephemeral: boolean,
        serviceName: string,
        enabled: boolean,
    };

    type ServiceInfo = { groupName: string, serviceName: string };

    type NacosNamingClientOptions = {
        logger?: unknown,
        serverList: string,
        namespace: string,
    };

    class NacosNamingClient {
        public constructor(opt: NacosNamingClientOptions);

        public ready(): Promise<unknown>;

        public subscribe(info: ServiceInfo, listener: (hosts: HostInfo[]) => void): void;

        public unSubscribe(info: ServiceInfo, listener?: Caibird.dp.Func): void;
    }
}

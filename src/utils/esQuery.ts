
export type EsQueryParams = {
    gte: string;
    lte?: string | null;
    step: string;
    domains?: string[] | null;
    uids?: string[] | null;
    oids?: string[] | null;
}

export const EsFilebeatURI = 'filebeat-*/_search';

export const buildFilebeatAccessQuery = (val: EsQueryParams) => {
    return {
        query: {
            bool: {
                filter: [
                    {
                        range: {
                            '@timestamp':
                            {
                                gte: val.gte,
                                lte: val.lte
                            }
                        }
                    },
                    ...(val.domains?.length
                        ? [{ terms: { 'domain.keyword': val.domains } }]
                        : []),
                    // ...(val.userId
                    //     ? [{ term: { 'user.id': val.userId } }]
                    //     : []),
                ],
            },
        },
        aggs: {
            time_buckets: {
                date_histogram: {
                    field: '@timestamp',
                    fixed_interval: val.step,
                },
            },
        },
        size: 0,
    };
};
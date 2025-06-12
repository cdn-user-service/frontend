import axios from 'axios';

interface queryElasticParams {
    uri: string;
    postData: any; // 可以进一步约束为 Record<string, any>
}

export const queryElastic = async ({ uri, postData }: queryElasticParams) => {
    const response = await axios.post(
        '/app/site/query/elk', 
        {
            path: uri,
            param: postData,
        });
    return response.data;
};
import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-2' });

const ssm = new AWS.SSM();

export const getParameterValue = async (parameterName: string): Promise<string> => {
    const params: AWS.SSM.GetParameterRequest = {
        Name: parameterName,
        WithDecryption: true,
    };

    try {
        const response = await ssm.getParameter(params).promise();
        if (response.Parameter) {
            return response.Parameter.Value ?? '';
        } else {
            throw new Error(`Parameter ${parameterName} not found.`);
        }
    } catch (error) {
        console.error(`Error getting parameter ${parameterName}: `, error);
        throw error;
    }
}

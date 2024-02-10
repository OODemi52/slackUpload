import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({ region: 'us-east-2' });
const ssm = new AWS.SSM();

export const getParameterValue = async (parameterName: string): Promise<string> => {
    
    // Check if the parameter is defined in the .env file
    const envValue = process.env[parameterName];
    if (envValue) {
        return envValue;
    }

    // If not in .env, then check AWS SSM Parameter Store
    const params: AWS.SSM.GetParameterRequest = {
        Name: parameterName,
        WithDecryption: true
    };

    try {
        const response = await ssm.getParameter(params).promise();
        if (response.Parameter && response.Parameter.Value) {
            return response.Parameter.Value;
        } else {
            throw new Error(`Parameter ${parameterName} not found or has no value.`);
        }
    } catch (error) {
        console.error(`Error getting parameter ${parameterName}: `, error);
        throw error;
    }
};

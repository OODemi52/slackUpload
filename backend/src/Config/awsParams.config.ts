import { SSMClient, GetParameterCommand, PutParameterCommand , GetParameterCommandInput, PutParameterCommandInput } from "@aws-sdk/client-ssm";


import dotenv from 'dotenv';

dotenv.config();

const region = 'us-east-2';

const ssmClient = new SSMClient({ region });

export const getParameterValue = async (parameterName: string): Promise<string> => {

    // Check if the parameter is defined in the .env file
    const envValue = process.env[parameterName];
    if (envValue) {
        return envValue;
    }

    // If not in .env, then check AWS SSM Parameter Store
    const params: GetParameterCommandInput = {
        Name: parameterName,
        WithDecryption: true
    };

    try {
        const response = await ssmClient.send(new GetParameterCommand(params));
        if (response.Parameter && response.Parameter.Value) {
            console.log('Parameter value:', response.Parameter.Value);
            return response.Parameter.Value;
        } else {
            throw new Error(`Parameter ${parameterName} not found or has no value.`);
        }
    } catch (error) {
        console.error(`Error getting parameter ${parameterName}: `, error);
        throw error;
    }
};

export const setParameterValue = async (parameterName: string, parameterValue: string): Promise<void> => {
    const params: PutParameterCommandInput = {
        Name: parameterName,
        Value: parameterValue,
        Type: 'SecureString',
        Overwrite: true,
    };

    try {
        await ssmClient.send(new PutParameterCommand(params));
        console.log(`Parameter ${parameterName} set successfully.`);
    } catch (error) {
        console.error(`Error setting parameter ${parameterName}: `, error);
        throw error;
    }
};
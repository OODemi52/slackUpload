import { SSMClient, GetParameterCommand, PutParameterCommand, GetParameterCommandInput, PutParameterCommandInput } from "@aws-sdk/client-ssm";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const region = 'us-east-2';
const isDevelopment = process.env.NODE_ENV === 'development';

const ssmClient = isDevelopment
  ? new SSMClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })
  : new SSMClient({ region });

const localParametersFile = path.join(__dirname, '../../local-parameters.json');

const getLocalParameters = (): Record<string, string> => {
  if (fs.existsSync(localParametersFile)) {
    return JSON.parse(fs.readFileSync(localParametersFile, 'utf-8'));
  }
  return {};
};

const setLocalParameter = (name: string, value: string) => {
  const parameters = getLocalParameters();
  parameters[name] = value;
  fs.writeFileSync(localParametersFile, JSON.stringify(parameters, null, 2));
};

export const getParameterValue = async (parameterName: string): Promise<string> => {
  if (isDevelopment) {
    // In development, first check .env file
    const envValue = process.env[parameterName];
    if (envValue) return envValue;

    // If not in .env, check local JSON file
    const localParameters = getLocalParameters();
    if (localParameters[parameterName]) return localParameters[parameterName];

    // If not found, return empty string or throw error based on your preference
    return '';
  }

  // In production, use AWS SSM
  const params: GetParameterCommandInput = {
    Name: parameterName,
    WithDecryption: true
  };

  try {
    const response = await ssmClient.send(new GetParameterCommand(params));
    if (response.Parameter && response.Parameter.Value) {
      return response.Parameter.Value;
    } else {
      throw new Error(`Parameter not found or has no value.`);
    }
  } catch (error) {
    console.error(`Error getting parameter.`, error);
    throw error;
  }
};

export const setParameterValue = async (parameterName: string, parameterValue: string): Promise<void> => {
  if (isDevelopment) {
    console.log(`Development: Setting ${parameterName} to ${parameterValue}`);
    setLocalParameter(parameterName, parameterValue);
    return;
  }

  // In production, use AWS SSM
  const params: PutParameterCommandInput = {
    Name: parameterName,
    Value: parameterValue,
    Type: 'SecureString',
    Overwrite: true,
  };

  try {
    await ssmClient.send(new PutParameterCommand(params));
    console.log(`Parameter set successfully.`);
  } catch (error) {
    console.error(`Error setting parameter.`, error);
    throw error;
  }
};
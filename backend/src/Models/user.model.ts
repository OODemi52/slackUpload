import { Schema, Document, model} from 'mongoose';

interface IUser extends Document {
    slackUserId: string;
    accessToken: string;
    tokenType: string;
    scope: string;
    botUserId: string;
    appId: string;
    team?: {
        name?: string | null;
        id?: string | null;
    };
    enterprise?: {
        name?: string | null;
        id?: string | null;
    };
    authedUser?: {
        id?: string | null;
        scope?: string | null;
        accessToken?: string | null;
        tokenType?: string | null;
    };
}

const userSchema = new Schema({
    slackUserId: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    tokenType: { type: String, required: true },
    scope: { type: String, required: true },
    botUserId: { type: String, required: true },
    appId: { type: String, required: true },
    team: {
        name: { type: String, required: true },
        id: { type: String, required: true },
    },
    enterprise: {
        name: { type: String, default: '' },
        id: { type: String, default: '' },
    },
    authedUser: {
        id: { type: String, required: true },
        scope: { type: String, required: true },
        accessToken: { type: String, required: true },
        tokenType: { type: String, required: true },
    },
}, { timestamps: true });

const User = model<IUser>('User', userSchema);

export default User;

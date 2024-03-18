import { Schema, Document, model} from 'mongoose';

interface IUser extends Document {
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
        tokenType?: string | null;
    };
    refreshToken?: string | null;
}

const userSchema = new Schema({
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
        tokenType: { type: String, required: true },
    },
    refreshToken: { type: String, required: true },
}, { timestamps: true });

const User = model<IUser>('User', userSchema);

export default User;
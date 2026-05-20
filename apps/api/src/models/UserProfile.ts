import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProfile extends Document {
  userId:   string;
  tenantId: string;
  name:     string;
  phone:    string;
  address:  string;
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId:   { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  name:     { type: String, default: '' },
  phone:    { type: String, default: '' },
  address:  { type: String, default: '' },
}, { timestamps: true });

const UserProfileModel: Model<IUserProfile> =
  mongoose.models.UserProfile ?? mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

export default UserProfileModel;

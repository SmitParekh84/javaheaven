import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITenant extends Document {
  tenantId:  string;
  domain:    string;
  brandName: string;
  active:    boolean;
  theme: {
    primaryColor:   string;
    secondaryColor: string;
    accentColor:    string;
    textColor:      string;
    mutedColor:     string;
    bgColor:        string;
    cardColor:      string;
    btnTextColor:   string;
    fontFamily:     string;
  };
  assets: {
    logoUrl:       string;
    faviconUrl:    string;
    heroImage:     string;
    footerLogoUrl: string;
  };
  contact: {
    email:   string;
    phone:   string;
    address: string;
  };
  social: {
    instagram?: string;
    facebook?:  string;
    twitter?:   string;
    linkedin?:  string;
  };
}

const TenantSchema = new Schema<ITenant>(
  {
    tenantId:  { type: String, required: true, unique: true },
    domain:    { type: String, required: true, unique: true, index: true },
    brandName: { type: String, required: true },
    active:    { type: Boolean, default: true },
    theme: {
      primaryColor:   { type: String, default: '#F5F5DC' },
      secondaryColor: { type: String, default: '#503225' },
      accentColor:    { type: String, default: '#FDF8F0' },
      textColor:      { type: String, default: '#1A1A1A' },
      mutedColor:     { type: String, default: '#D3D3D3' },
      bgColor:        { type: String, default: '#F5F5DC' },
      cardColor:      { type: String, default: '#FFFFFF' },
      btnTextColor:   { type: String, default: '#503225' },
      fontFamily:     { type: String, default: 'League Spartan' },
    },
    assets: {
      logoUrl:       { type: String, default: '/images/logo-3.png' },
      faviconUrl:    { type: String, default: '/favicon.png' },
      heroImage:     { type: String, default: '' },
      footerLogoUrl: { type: String, default: '/images/logo-muted-2.png' },
    },
    contact: {
      email:   { type: String, default: '' },
      phone:   { type: String, default: '' },
      address: { type: String, default: '' },
    },
    social: {
      instagram: String,
      facebook:  String,
      twitter:   String,
      linkedin:  String,
    },
  },
  { timestamps: true }
);

const TenantModel: Model<ITenant> =
  mongoose.models.Tenant ?? mongoose.model<ITenant>('Tenant', TenantSchema);

export default TenantModel;

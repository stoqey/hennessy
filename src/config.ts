require("dotenv").config();

const { env = {} } = process || {};

export const APP_NAME = env.APP_NAME || 'promethazine';

export const DO_TOKEN = env.DO_TOKEN;
export const CLUSTER_ID = env.CLUSTER_ID;
'use server'

import * as mongoose from "mongoose";
import getMongoURI from "./credentials";

export default async function connectDB(collectionName:string) {
  await mongoose
    .connect(getMongoURI(collectionName))
    .then(() => {
      console.log("Coneceted ...");
    })
    .catch((e) => {
      console.log("Error : ", e);
    });
}

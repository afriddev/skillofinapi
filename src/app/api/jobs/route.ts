import { responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import projectModel from "@/app/mongodb/models/projectModel";
import { NextResponse } from "next/server";

export async function GET(){


    try{
        await connectDB("users");

        const jobs = await projectModel.find();


    return NextResponse.json({
        message:responseEnums?.SUCCESS,
        jobs
    },{
        status:200
    })
    

    }
    catch(e){
        return NextResponse.json({
            message:responseEnums?.ERROR
        },{
            status:500
        })
    }




}
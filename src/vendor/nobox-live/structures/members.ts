/* eslint-disable @typescript-eslint/no-explicit-any */
import { Space } from "nobox-client";
import { getArrayField, getNumberField, getObjectField, getTextField } from "../help";
import { AcademicInfo, PersonalInfo, Member, LocationInfo, FellowshipInfo } from "../types";
import { createLiveRowSchema, createRowSchema } from "../../config";

const space = "Members";
const description = "Record space for members"




const PersonalInfoStructure = {
    ...getTextField('picture', {required: false}),
    ...getTextField('firstname'),
    ...getTextField('lastname'),
    ...getTextField('othername', {required: false}),
    ...getTextField('email', {unique: true}),
    ...getTextField('contacts'),
    ...getTextField('dateofbirth'),
    ...getTextField('gender'),
} as Record<keyof PersonalInfo, any>


// ! Put all other fields to false, for incremental save
const AcademicInfoStructure = {
    ...getTextField('matricNo', {required: false}),
    ...getTextField('department', {required: false}),
    ...getArrayField('cgpa', {required: false}),
    
} as Record<keyof AcademicInfo, any>

const FellowshipInfoStructure = {
    ...getTextField('level', {required: false}),
    ...getTextField('unit', {required: false}),
    ...getTextField('team', {required: false}),
} as Record<keyof FellowshipInfo, any>


const LocationInfoStructure = {
    ...getTextField('address', {required: false}),
    ...getTextField('state', {required: false}),
    ...getTextField('country', {required: false}),
    ...getTextField('zone', {required: false}),
    ...getTextField('lodge', {required: false}),
} as Record<keyof LocationInfo, any>


export const MemberStructure: Space<Member> = {
    space, description,
    structure: {
        ...PersonalInfoStructure,
        ...AcademicInfoStructure,
        ...FellowshipInfoStructure,
        ...LocationInfoStructure   
    } as any
}

export const MemberModel = createLiveRowSchema<Member>(MemberStructure);


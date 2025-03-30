
import { getArrayField, getBooleanField, getDateField, getTextField } from "./help";
import { Generation, Tenure, Unit, Zone } from "./types";

type TenureStructure = Omit<Tenure, "offices" | "levels"> & Partial<Pick<Tenure, "offices" | "logo">>;

// Tenure settnigs
export const tenureSpace = "Tenure";
export const tenureSpaceDescription = "Record space for Tenures";
export const tenureSpaceStructure = {
    ...getTextField('theme', {required: true}),
    ...getTextField('session', {required: true}),
    ...getTextField('logo', {required: true}),
    ...getArrayField('offices', {required: false, defaultValue:[]}),
    ...getArrayField('levels', {required: false, defaultValue:[]}),
    ...getBooleanField('isEnded', {required: true, defaultValue:false}),
    ...getDateField('endedDate', {required: false}),
} as Record<keyof Tenure, any>


// Unit Settings
export const unitSpace = "Units";
export const unitSpaceDescription = "Record space for Units";
export const unitSpaceStructure = {
    ...getTextField('name', {required: true}),
    ...getTextField('type', {required: true}),
    ...getTextField('alias', {required: false}),
    ...getTextField('description', {required: true}),
    ...getTextField('leaderTitle', {required: true}),
    ...getTextField('logo', {required: false}),
    ...getTextField('email', {required: false}),
} as Record<keyof Unit, any>


// Generation Settings
export const generationSpace = "Generation";
export const generationSpaceDescription = "Record space for Generations";
export const generationSpaceStructure = {
    ...getTextField('name', {required: true}),
    ...getTextField('logo', {required: false}),
} as Record<keyof Generation, any>


export const zoneSpace = "Zone";
export const zoneSpaceDescription = "Record space for Zones";
export const zoneSpaceStructure = {
    ...getTextField('name', {required: true}),
    ...getTextField('address', {required: true}),
} as Record<keyof Zone, any>

import { StructureItem } from "nobox-client";

export type ParsedField = Record<string, StructureItem >;


function parseFieldProperties(name:string, mainOption:Pick<StructureItem, 'type' | 'hashed'>, auxoption: Partial<StructureItem> = {}) {
    const {description, required = true, ...rest} = auxoption;
    // const {type, hashed} = mainOption;
    
    return  {
        ...mainOption,
        description: description || `${name} field`,
        required,
        ...rest
    }

}

export function getTextField(name: string, option: Partial<StructureItem> = {}): ParsedField{
    return {
        [name]: parseFieldProperties(name, {type: String}, option)
    }
}

export function getHashedField(name: string, option: Partial<StructureItem> = {}): ParsedField{

    return {[name]: parseFieldProperties(name, {type: String, hashed: true}, option)}

}

export function getNumberField(name: string, option: Partial<StructureItem> = {}): ParsedField{
    return {[name]: parseFieldProperties(name, {type: Number}, option)}    
}

export function getArrayField(name: string, option: Partial<StructureItem> = {}): ParsedField{
    return {[name]: parseFieldProperties(name, {type: Array}, option)}    
}

export function getObjectField(name: string, option: Partial<StructureItem> = {}): ParsedField{
    return {[name]: parseFieldProperties(name, {type: Object}, option)}
}

export function getBooleanField(name: string, option: Partial<StructureItem> = {}): ParsedField{
    return {[name]: parseFieldProperties(name, {type: Boolean}, option)}
}

export function getDateField(name: string, option: Partial<StructureItem> = {}): ParsedField{
    return {[name]: parseFieldProperties(name, {type: String}, option)}
}


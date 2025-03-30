import { Space } from "nobox-client";
// import { Generation, Tenure, Unit } from "../../../types/tenure.types";
import { generationSpace, generationSpaceDescription, generationSpaceStructure, tenureSpace, tenureSpaceDescription, tenureSpaceStructure, unitSpace, unitSpaceDescription, unitSpaceStructure } from "../structures-settings";
import { createLiveRowSchema } from "../../config";
import { Generation, Tenure, Unit } from "../types";



export const TenureStructure: Space<Tenure> = {
    space: tenureSpace,
    description: tenureSpaceDescription,
    structure: tenureSpaceStructure
}


export const UnitStructure: Space<Unit> = {
    space: unitSpace,
    description: unitSpaceDescription,
    structure: unitSpaceStructure
}

export const GenerationStructure: Space<Generation> = {
    space: generationSpace,
    description: generationSpaceDescription,
    structure: generationSpaceStructure,
}

// Models

export const TenureModel = createLiveRowSchema<Tenure>(TenureStructure);
export const UnitModel = createLiveRowSchema<Unit>(UnitStructure);
export const GenerationModel = createLiveRowSchema<Generation>(GenerationStructure);

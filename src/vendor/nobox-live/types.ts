import { ReturnObject } from "nobox-client";

export type UserFieldName = "picture" | "firstname" |
    "lastname" | "othername" | "email" | "contacts" |
    "contacts" | "level" | "department" | "cgpa" |  "unit" |
    "address" | "state" | "country" |"zone" | "lodge" |  "dateofbirth" |
    "gender"
;

export type CGPA = number | `${number}`;

type CGPAObject = {
    value: CGPA;
    timestamp: Date | string;
};

export type PersonalInfo = {
    picture?: string;
    firstname: string;
    lastname: string;
    othername?: string;
    email: string;
    contacts: string;
    dateofbirth: Date | string;
    gender: string;
};

export type AcademicInfo = {
    matricNo: string;
    department: string;
    cgpa: CGPAObject[];
};
export type IncomingAcademicInfo = Omit<AcademicInfo, "cgpa"> & {
    cgpa: CGPA;
}

export type FellowshipInfo = {
    level: string;
    unit?: string;
    team?: string;
};

export type LocationInfo = {
    address: string;
    state: string;
    country: string;
    zone: string;
    lodge: string;
};

export type UserSectionData = PersonalInfo | AcademicInfo | FellowshipInfo | LocationInfo;
export type UserData = PersonalInfo & AcademicInfo & FellowshipInfo & LocationInfo;

// Models
export type Member = UserData;
export type MemberObject = ReturnObject<Member>;
export type MemberId = string;

export type TenureOffice = {
    exco: MemberId;
    unit: UnitId;
    theme?: string;
};

export type TenureLevel = {
    label: "200" | "300" | "400" | "500";
    generation: GenerationId;
}

export type Tenure = {
    theme: string;
    session: string;
    logo: string;
    offices: TenureOffice[];
    levels: TenureLevel[];
    isEnded: boolean;
    endedDate?: Date | string;
}

export type TenureObject = ReturnObject<Tenure>;
export type TenureId = string;

export type Unit = {
    name: string;
    leaderTitle: string;
    alias?: string;
    description: string;
    logo?: string;
    type: "unit" | "team";
    email?: string; // * Official email address of @rcffuta.com
}
export type UnitObject = ReturnObject<Unit>;
export type UnitId = string;


export type Generation = {
    name: string;
    logo?: string;
}
export type GenerationObject = ReturnObject<Generation>;
export type GenerationId = string;


export type UpdateTenureType<T> = T & {tenureId: TenureId};
export type UpdateReturnType<T> = T | {
    tenure: TenureObject;
    data: T
};

export type Zone = {
    name: string;
    address: string;
}

export type ZoneObject = ReturnObject<Zone>;
export type ZoneId = string;


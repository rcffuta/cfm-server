import  {  Config,  getFunctions,  getSchemaCreator  }  from  "nobox-client";

const endpoint =  "https://api.nobox.cloud"
const token =  process.env.NEXT_PUBLIC_NB_TOKEN || process.env.NB_TOKEN || "";

export const config: Config = {
    endpoint, // or http://localhost:8000 if you are running local
    project:  "CFM",
    token,
};

export const liveconfig: Config = {
    endpoint, // or http://localhost:8000 if you are running local
    project:  "RCFFUTA",
    token,
};


// console.debug({config, liveconfig})

export const createRowSchema = getSchemaCreator(config, { type: "rowed" });
export const createLiveRowSchema = getSchemaCreator(liveconfig, { type: "rowed" });

// export const createKeyGroupSchema = getSchemaCreator(config, { type: "key-group" });

export  const  Nobox  =  getFunctions(config);
export  const  LiveNobox  =  getFunctions(config);

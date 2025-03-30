import  {  Config,  getFunctions,  getSchemaCreator  }  from  "nobox-client";

export const config: Config = {
    endpoint:  "https://api.nobox.cloud", // or http://localhost:8000 if you are running local
    project:  "CFM",
    token: process.env.NB_TOKEN || ""
};

export const liveconfig: Config = {
    endpoint:  "https://api.nobox.cloud", // or http://localhost:8000 if you are running local
    project:  "RCFFUTA",
    token: process.env.NB_TOKEN || ""
};

export const createRowSchema = getSchemaCreator(config, { type: "rowed" });
export const createLiveRowSchema = getSchemaCreator(liveconfig, { type: "rowed" });

// export const createKeyGroupSchema = getSchemaCreator(config, { type: "key-group" });

export  const  Nobox  =  getFunctions(config);
export  const  LiveNobox  =  getFunctions(config);

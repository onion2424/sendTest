import fs from "fs";
import { systemInfo, utils } from "../../Common/systemCommon.js";
import fireStoreManager from "../../FireStoreAPI/manager.js"
import { S_RunningState } from "../../FireStoreAPI/Collection/S_RunningState/manager.js";

const file = "./Dockerfile";

//const fd = fs.openSync( file, "w");

const text = systemInfo.isTest() ?
`FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD [ "node", "./src/EntryPoint/Observer/index.js"]`
:
`FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD [ "node", "./src/EntryPoint/Observer/index.js", "-release"]`
;

// version up
const docs = await fireStoreManager.getDocs("S_RunningState", [["job", "==", "OBSERVER"]], 1);
for await (const doc of docs) {
    /**
     * @type {S_RunningState}
     */
    const state = doc.data();
    const nextVersion = utils.nextVersion(state.version, 3);
    await doc.ref.update({version: nextVersion});
    console.log(nextVersion);
}

fs.writeFileSync(file , text);
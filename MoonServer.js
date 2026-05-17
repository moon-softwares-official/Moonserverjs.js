import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9j_s1B--EzKzNY9YwmNvCCB1ltxfxjj8",
  authDomain: "moonserverjs.firebaseapp.com",
  databaseURL: "https://moonserverjs-default-rtdb.firebaseio.com",
  projectId: "moonserverjs",
  storageBucket: "moonserverjs.firebasestorage.app",
  messagingSenderId: "792741334503",
  appId: "1:792741334503:web:5cc0b4ca1d5363edbec142"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

window.moon = {

  apiKey: null,
  connected: false,
  premium: false,
  maxUsers: 20,

  async start(apiKey){

    this.apiKey = apiKey;

    const serverRef =
    ref(db, "servers/" + apiKey);

    const snapshot =
    await get(serverRef);

    if(!snapshot.exists()){

      alert("ERROR: API KEY DOES NOT EXIST.");

      return;

    }

    const data =
    snapshot.val();

    this.premium =
    data.premium || false;

    if(!data.usersOnline){
      data.usersOnline = 0;
    }

    if(data.usersOnline >= 20){

      alert("SERVER FULL. PLEASE WAIT.");

      return;

    }

    await set(serverRef, {

      ...data,

      online: true,

      usersOnline:
      data.usersOnline + 1

    });

    this.connected = true;

    console.log(
      "MoonServer connected."
    );

  },

  name(saveName){

    const self = this;

    return {

      set content(value){

        if(!self.connected){

          alert(
            "MoonServer not connected."
          );

          return;

        }

        const savesRef =
        ref(
          db,
          "servers/" +
          self.apiKey +
          "/saves"
        );

        get(savesRef).then(async (snapshot)=>{

          let total = 0;

          if(snapshot.exists()){

            total =
            Object.keys(snapshot.val()).length;

          }

          const limit =
          self.premium ? 999999 : 7;

          const alreadyExists =
          snapshot.exists() &&
          snapshot.val()[saveName];

          if(
            total >= limit &&
            !alreadyExists
          ){

            alert(
              "SAVE LIMIT REACHED."
            );

            return;

          }

          const saveRef =
          ref(
            db,
            "servers/" +
            self.apiKey +
            "/saves/" +
            saveName
          );

          await set(saveRef, {

            content: value

          });

        });

      },

      async get(){

        const saveRef =
        ref(
          db,
          "servers/" +
          self.apiKey +
          "/saves/" +
          saveName
        );

        const snapshot =
        await get(saveRef);

        if(!snapshot.exists()){

          return null;

        }

        return snapshot.val().content;

      },

      watch(callback){

        const saveRef =
        ref(
          db,
          "servers/" +
          self.apiKey +
          "/saves/" +
          saveName
        );

        onValue(saveRef, (snapshot)=>{

          if(snapshot.exists()){

            callback(
              snapshot.val().content
            );

          }

        });

      }

    };

  }

};

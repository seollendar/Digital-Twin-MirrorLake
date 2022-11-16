class Postgres {
   async createTable({ sql }) {
      pgClient
         .query(sql)
         .then((res) => {
            console.log(sql);
            console.log("res: ", res.command);
         })
         .catch((e) => {
            console.log(e.stack);
         });

      return 0;
   }

   selectData() {
      let sql = ``;
      pgClient
         .query(sql)
         .then((response) => {
            console.log(sql);
            //console.log(response)
            if (response.rowCount) {
               var {
                  ae,
                  container,
                  latitude,
                  longitude,
                  altitude,
                  creationtime,
               } = response.rows[0];
               var time = moment(creationtime).format("YYYYMMDDTHHmmss");
               let parseresponse = {
                  ae,
                  container,
                  location: { latitude, longitude, altitude },
                  time,
               };
            } else {
               //if no response
               console.log(response);
            }
         })
         .catch((e) => {
            console.log(e.stack);
         });
   }
}

module.exports = Postgres;

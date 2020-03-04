const Cloudant = require('@cloudant/cloudant');
const cloudant = Cloudant({ account: process.env.CLOUDANT_USERNAME, password: process.env.CLOUDANT_PASSWORD, url: process.env.CLOUDANT_URL })

let db = cloudant.db.use('leaderboard');
let docName = process.env.CLOUDANT_DOC;

const sortByValue = (obj) => {
  return Object.keys(obj).sort((x,y) => obj[x]-obj[y])
}

const setupDoc = async() => {
  const doc = await fetchData();
  if( doc.board === undefined) {
    doc.board = {};
  }
  console.log('DB setup complete')
  await db.insert(doc);
}

const fetchData = async() => {
  return await db.get(docName)
};

const updateBoard = async(leaderboard) => {
  const sortedObj = {}
  let doc = await fetchData();
  Object.keys(leaderboard).forEach((user) => {
    if(!doc.board.hasOwnProperty(user) || doc.board[user] > leaderboard[user]) {
       doc.board[user] = leaderboard[user]
    } 
  });
  
  const sortedKeys = sortByValue(doc.board);
  sortedKeys.forEach((key) => {
    sortedObj[key] = doc.board[key]
  })
  doc.board = sortedObj;
  await db.insert(doc);
};


module.exports.fetchData = fetchData;
module.exports.updateBoard = updateBoard;
module.exports.setupDoc = setupDoc;
